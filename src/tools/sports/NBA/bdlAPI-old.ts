import { BalldontlieAPI } from '@balldontlie/sdk';
import pThrottle from 'p-throttle';

export class BallDontLieAPIWrapper {
  private api: BalldontlieAPI;
  private throttle: ReturnType<typeof pThrottle>;

  constructor(apiKey: string) {
    this.api = new BalldontlieAPI({ apiKey });
    this.throttle = pThrottle({
      limit: 30, // 30 requests per minute
      interval: 60000, // 60 seconds
    });
  }

  private async handleRateLimit(requestFn: Function, ...args: any[]) {
    let retries = 3;
    let delay = 2000; // Start with a 2-second delay

    while (retries > 0) {
      try {
        // Throttle the request to ensure we don't exceed the limit
        return await this.throttle(() => requestFn(...args))();
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limit hit, retrying after delay...');
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries--;
          delay *= 2; // Exponential backoff
        } else {
          throw error; // Non-429 errors should not trigger retries
        }
      }
    }
    throw new Error('Failed after retries due to rate limit');
  }

  // Expose API methods with throttling and retry logic
  // Add all API calls as wrapper methods

  // Teams
  public async getTeams(params?: any) {
    return this.handleRateLimit(this.api.nba.getTeams, params);
  }

  public async getTeam(team_id: number) {
    return this.handleRateLimit(this.api.nba.getTeam, team_id);
  }

  // Players
  public async getPlayers(params?: any) {
    return this.handleRateLimit(this.api.nba.getPlayers, params);
  }

  public async getPlayer(player_id: number) {
    return this.handleRateLimit(this.api.nba.getPlayer, player_id);
  }

  // Games
  public async getGames(params?: any) {
    return this.handleRateLimit(this.api.nba.getGames, params);
  }

  public async getGame(game_id: number) {
    return this.handleRateLimit(this.api.nba.getGame, game_id);
  }
}
