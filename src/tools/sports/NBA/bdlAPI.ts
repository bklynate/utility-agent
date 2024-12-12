import { BalldontlieAPI } from '@balldontlie/sdk';
import pThrottle from 'p-throttle';

// Be more conservative than the stated 30/90 limit.
// Let's try 20 requests per 90 seconds (about 1 request every 4.5s).
const MAX_RETRIES = 3;
const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_INTERVAL = 90 * 1000; // 90 seconds

const throttledApiCall = pThrottle({
  limit: RATE_LIMIT_REQUESTS,
  interval: RATE_LIMIT_INTERVAL,
})((apiCall: () => Promise<any>) => apiCall());

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class BallDontLieAPIWrapper {
  private api: BalldontlieAPI;

  constructor(apiKey: string) {
    this.api = new BalldontlieAPI({ apiKey });
  }

  private async executeWithRetries<T>(
    apiCall: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> {
    try {
      // Make the call through the throttler
      const result = await throttledApiCall(apiCall);
      // Add a forced delay after every call to space out requests more
      await delay(3500); 
      return result;
    } catch (error: any) {
      // If we hit a 429, let's wait a bit longer before retrying
      if (retries > 0 && error?.response?.status === 429) {
        console.warn(`Rate limit hit. Waiting 30 seconds before retry...`);
        await delay(30000);
        return this.executeWithRetries(apiCall, retries - 1);
      }
      throw error;
    }
  }

  async getTeams(params?: { division?: string; conference?: string }) {
    return this.executeWithRetries(() => this.api.nba.getTeams(params));
  }

  async getTeam(teamId: number) {
    return this.executeWithRetries(() => this.api.nba.getTeam(teamId));
  }

  async getPlayers(params?: {
    search?: string;
    first_name?: string;
    last_name?: string;
    team_ids?: number[];
    player_ids?: number[];
    cursor?: number;
    per_page?: number;
  }) {
    return this.executeWithRetries(() => this.api.nba.getPlayers(params));
  }

  async getPlayer(playerId: number) {
    return this.executeWithRetries(() => this.api.nba.getPlayer(playerId));
  }

  async getGames(params?: {
    cursor?: number;
    per_page?: number;
    dates?: string[];
    seasons?: number[];
    team_ids?: number[];
    postseason?: boolean;
    start_date?: string;
    end_date?: string;
  }) {
    return this.executeWithRetries(() => this.api.nba.getGames(params));
  }

  async getGame(gameId: number) {
    return this.executeWithRetries(() => this.api.nba.getGame(gameId));
  }
}
