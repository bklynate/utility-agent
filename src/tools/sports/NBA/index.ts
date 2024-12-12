import { z } from 'zod';
import { BallDontLieAPIWrapper } from './bdlAPI.ts';
import type { ToolFn } from 'types'; // Adjust import if needed

// Initialize the Balldontlie API instance.
// You should have an environment variable or configuration for your API key.
const api = new BallDontLieAPIWrapper(
  process.env.BALL_DONT_LIE_API_KEY || 'YOUR_API_KEY'
);

const teamSeasonGamesCache = new Map<string, any[]>();

/**
 * Tool: get_all_teams
 * Purpose: Retrieves all NBA teams.
 */
export const getAllTeamsToolDefinition = {
  name: 'get_all_teams',
  description: 'Fetch all NBA teams from the Balldontlie API.',
  parameters: z.object({}),
  strict: true,
};

type GetAllTeamsArgs = z.infer<typeof getAllTeamsToolDefinition.parameters>;

export const getAllTeamsTool: ToolFn<GetAllTeamsArgs, string> = async () => {
  const teamsData = await api.getTeams();

  // Return a formatted list of teams
  return JSON.stringify(teamsData.data, null, 2);
};

/**
 * Tool: get_team_by_id
 * Purpose: Retrieves a specific team by its ID.
 */
export const getTeamByIdToolDefinition = {
  name: 'get_team_by_id',
  description: 'Fetch a specific NBA team by its ID.',
  parameters: z
    .object({
      team_id: z
        .number()
        .describe(
          'The unique identifier of the NBA team. Example: 1 for the Atlanta Hawks.'
        ),
    })
    .describe(
      'Input parameters required to fetch a specific NBA team by its unique ID.'
    ),
  strict: true,
};

type GetTeamByIdArgs = z.infer<typeof getTeamByIdToolDefinition.parameters>;

export const getTeamByIdTool: ToolFn<GetTeamByIdArgs, string> = async ({
  toolArgs,
}) => {
  const { team_id } = toolArgs;
  const teamData = await api.getTeam(team_id);

  // teamData.data is an array, typically with one item
  return JSON.stringify(teamData.data, null, 2);
};

/**
 * Tool: get_all_players
 * Purpose: Retrieves all players, with optional filters.
 */
export const getAllPlayersToolDefinition = {
  name: 'get_all_players',
  description:
    'Fetch all players with optional filters like search, first_name, last_name, team_ids, and pagination options.',
  parameters: z
    .object({
      search: z
        .string()
        .optional()
        .describe('Search term for first or last name. Example: "Jordan"'),
      first_name: z
        .string()
        .optional()
        .describe('Filter players by their first name. Example: "Michael"'),
      last_name: z
        .string()
        .optional()
        .describe('Filter players by their last name. Example: "Curry"'),
      team_ids: z
        .array(z.number())
        .optional()
        .describe('Filter players by specific team IDs. Example: [1, 10]'),
      player_ids: z
        .array(z.number())
        .optional()
        .describe(
          'Filter players by specific player IDs. Example: [19] for Stephen Curry'
        ),
      cursor: z
        .number()
        .optional()
        .describe(
          'Cursor for paginated results. Use this to retrieve the next set of results.'
        ),
      per_page: z
        .number()
        .optional()
        .describe(
          'Number of results to return per page. Maximum value is 100. Example: 25'
        ),
    })
    .describe(
      'Input parameters for fetching NBA players, allowing optional filters like name, team, or pagination options.'
    ),
  strict: true,
};

type GetAllPlayersArgs = z.infer<typeof getAllPlayersToolDefinition.parameters>;

export const getAllPlayersTool: ToolFn<GetAllPlayersArgs, string> = async ({
  toolArgs,
}) => {
  const {
    search,
    first_name,
    last_name,
    team_ids,
    player_ids,
    cursor,
    per_page,
  } = toolArgs;

  const playersData = await api.getPlayers({
    search,
    first_name,
    last_name,
    team_ids,
    player_ids,
    cursor,
    per_page,
  });

  return JSON.stringify(playersData, null, 2);
};

/**
 * Tool: get_player_by_id
 * Purpose: Retrieves a specific player by their ID.
 */
export const getPlayerByIdToolDefinition = {
  name: 'get_player_by_id',
  description: 'Fetch a specific player by their ID.',
  parameters: z
    .object({
      player_id: z
        .number()
        .describe(
          'The unique identifier for a player. Example: 19 for Stephen Curry'
        ),
    })
    .describe(
      'Input parameters for fetching a specific NBA player by their unique player ID.'
    ),
  strict: true,
};

type GetPlayerByIdArgs = z.infer<typeof getPlayerByIdToolDefinition.parameters>;

export const getPlayerByIdTool: ToolFn<GetPlayerByIdArgs, string> = async ({
  toolArgs,
}) => {
  const { player_id } = toolArgs;
  const playerData = await api.getPlayer(player_id);

  return JSON.stringify(playerData.data, null, 2);
};

/**
 * Tool: get_all_games
 * Purpose: Retrieves all games with optional filters like dates, seasons, team_ids, etc.
 */
export const getAllGamesToolDefinition = {
  name: 'get_all_games',
  description:
    'Fetch all games with optional filters like dates, seasons, team_ids, and more.',
  parameters: z
    .object({
      cursor: z
        .number()
        .optional()
        .describe(
          'Pagination cursor for games. Use to fetch subsequent pages of results.'
        ),
      per_page: z
        .number()
        .optional()
        .describe('Number of results per page, default is 25 and max is 100.'),
      dates: z
        .array(z.string())
        .optional()
        .describe(
          'Filter by specific dates. Format: ["YYYY-MM-DD", "YYYY-MM-DD"]. Example: ["2024-01-01", "2024-01-02"].'
        ),
      seasons: z
        .array(z.number())
        .optional()
        .describe('Filter by NBA seasons. Example: [2022, 2023].'),
      team_ids: z
        .array(z.number())
        .optional()
        .describe(
          'Filter games by team IDs. Example: [1, 2] for specific teams.'
        ),
      postseason: z
        .boolean()
        .optional()
        .describe(
          'Filter games by type. true for playoffs, false for regular season, or omit for both.'
        ),
      start_date: z
        .string()
        .optional()
        .describe(
          'Filter by start date. Format: YYYY-MM-DD. Example: "2024-01-01".'
        ),
      end_date: z
        .string()
        .optional()
        .describe(
          'Filter by end date. Format: YYYY-MM-DD. Example: "2024-12-31".'
        ),
    })
    .describe(
      'Input parameters for fetching all games, including optional filters such as dates, seasons, team IDs, and pagination options.'
    ),
  strict: true,
};

type GetAllGamesArgs = z.infer<typeof getAllGamesToolDefinition.parameters>;

export const getAllGamesTool: ToolFn<GetAllGamesArgs, string> = async ({
  toolArgs,
}) => {
  const {
    cursor,
    per_page,
    dates,
    seasons,
    team_ids,
    postseason,
    start_date,
    end_date,
  } = toolArgs;

  const gamesData = await api.getGames({
    cursor,
    per_page,
    dates,
    seasons,
    team_ids,
    postseason,
    start_date,
    end_date,
  });

  return JSON.stringify(gamesData, null, 2);
};

/**
 * Tool: get_game_by_id
 * Purpose: Retrieves a specific game by its ID.
 */
export const getGameByIdToolDefinition = {
  name: 'get_game_by_id',
  description: 'Fetch a specific game by its ID.',
  parameters: z
    .object({
      game_id: z
        .number()
        .describe(
          'The unique identifier of the game to fetch. Example: 1 for a specific game.'
        ),
    })
    .describe(
      'Input parameters for fetching a specific game by its unique ID.'
    ),
  strict: true,
};

type GetGameByIdArgs = z.infer<typeof getGameByIdToolDefinition.parameters>;

export const getGameByIdTool: ToolFn<GetGameByIdArgs, string> = async ({
  toolArgs,
}) => {
  const { game_id } = toolArgs;
  const gameData = await api.getGame(game_id);

  return JSON.stringify(gameData.data, null, 2);
};

/**
 * Tool: get_players_by_team_name
 * Purpose: Combines calls to get all teams, find a specific team by name, then get players for that team.
 */
export const getPlayersByTeamNameToolDefinition = {
  name: 'get_players_by_team_name',
  description:
    'Given a team name, returns all players on that team, sorted by last name.',
  parameters: z
    .object({
      team_name: z
        .string()
        .describe('The full name of the team, e.g. "Golden State Warriors"'),
      per_page: z
        .number()
        .optional()
        .describe(
          'Number of players to return per page. Default is 25, maximum is 100.'
        ),
    })
    .describe(
      'Input parameters for fetching all players from a specific NBA team, sorted by last name.'
    ),
  strict: true,
};

type GetPlayersByTeamNameArgs = z.infer<
  typeof getPlayersByTeamNameToolDefinition.parameters
>;

export const getPlayersByTeamNameTool: ToolFn<
  GetPlayersByTeamNameArgs,
  string
> = async ({ toolArgs }) => {
  const { team_name, per_page } = toolArgs;

  // Step 1: Get all teams
  const teamsData = await api.getTeams();

  // Step 2: Find the team by full_name
  const matchingTeam = teamsData.data.find(
    (t) => t.full_name.toLowerCase() === team_name.toLowerCase()
  );

  if (!matchingTeam) {
    return `No team found with the name "${team_name}".`;
  }

  // Step 3: With the team_id, get players from that team
  const playersData = await api.getPlayers({
    team_ids: [matchingTeam.id],
    per_page: per_page || 50, // default to 50 for a nice list
  });

  // Step 4: Sort players by last_name
  const players = playersData.data.sort((a, b) =>
    a.last_name.localeCompare(b.last_name)
  );

  return JSON.stringify(players, null, 2);
};

/**
 * Another Example: get_team_of_player
 * Given a partial player name, find all matching players and return their team info.
 */
export const getTeamOfPlayerToolDefinition = {
  name: 'get_team_of_player',
  description:
    'Given part of a player’s name, returns the players that match and their corresponding team information.',
  parameters: z
    .object({
      player_search: z
        .string()
        .describe(
          'Partial or full name of the player to search, e.g., "Curry" or "LeBron"'
        ),
      per_page: z
        .number()
        .optional()
        .describe(
          'Number of players to return per page. Default is 25, maximum is 100.'
        ),
    })
    .describe(
      'Input parameters for searching players by partial or full name and retrieving their team information.'
    ),
  strict: true,
};

type GetTeamOfPlayerArgs = z.infer<
  typeof getTeamOfPlayerToolDefinition.parameters
>;

export const getTeamOfPlayerTool: ToolFn<GetTeamOfPlayerArgs, string> = async ({
  toolArgs,
}) => {
  const { player_search, per_page } = toolArgs;

  // Search for players by a partial name
  const playersData = await api.getPlayers({
    search: player_search,
    per_page: per_page || 25,
  });

  // Extract player info and their teams
  const results = playersData.data.map((player) => ({
    player_id: player.id,
    player_name: `${player.first_name} ${player.last_name}`,
    team: player.team ? player.team.full_name : 'No team info available',
  }));

  return JSON.stringify(results, null, 2);
};

/**
 * Another Example: get_games_for_team_in_date_range
 * Given a team full name and a date range, return all games that team played in that period.
 */
export const getGamesForTeamInDateRangeToolDefinition = {
  name: 'get_games_for_team_in_date_range',
  description:
    'Given a team name and date range, returns all games that team played during that period.',
  parameters: z
    .object({
      team_name: z
        .string()
        .describe('The full name of the team, e.g., "Boston Celtics".'),
      start_date: z
        .string()
        .describe('The starting date of the range in YYYY-MM-DD format.'),
      end_date: z
        .string()
        .describe('The ending date of the range in YYYY-MM-DD format.'),
      per_page: z
        .number()
        .optional()
        .describe(
          'The number of games to retrieve per page. Default is 25, with a maximum of 100.'
        ),
    })
    .describe(
      'Input parameters for retrieving all games played by a team within a specified date range, optionally paginated.'
    ),
  strict: true,
};

type GetGamesForTeamInDateRangeArgs = z.infer<
  typeof getGamesForTeamInDateRangeToolDefinition.parameters
>;

export const getGamesForTeamInDateRangeTool: ToolFn<
  GetGamesForTeamInDateRangeArgs,
  string
> = async ({ toolArgs }) => {
  const { team_name, start_date, end_date, per_page } = toolArgs;

  // Fetch all teams to find the team_id
  const teamsData = await api.getTeams();
  const matchingTeam = teamsData.data.find(
    (t: any) => t.full_name.toLowerCase() === team_name.toLowerCase()
  );

  if (!matchingTeam) {
    return `No team found with the name "${team_name}".`;
  }

  // Fetch games for that team in the given date range
  const gamesData = await api.getGames({
    team_ids: [matchingTeam.id],
    start_date,
    end_date,
    per_page: per_page || 25,
  });

  // Return the list of games
  return JSON.stringify(gamesData.data, null, 2);
};

/**
 * Given a teamId and season, returns the team's win/loss record.
 * We determine a win if:
 * - If team is home_team and home_team_score > visitor_team_score
 * - If team is visitor_team and visitor_team_score > home_team_score
 */
async function getTeamRecord(
  teamId: number,
  season: number
): Promise<{ wins: number; losses: number }> {
  const games = await fetchAllTeamGamesForSeason(teamId, season);
  let wins = 0;
  let losses = 0;

  for (const game of games) {
    const { home_team, visitor_team, home_team_score, visitor_team_score } =
      game;
    let isWin = false;

    if (home_team.id === teamId) {
      // Team is home
      if (home_team_score > visitor_team_score) isWin = true;
    } else if (visitor_team.id === teamId) {
      // Team is visitor
      if (visitor_team_score > home_team_score) isWin = true;
    }

    if (isWin) wins++;
    else losses++;
  }

  return { wins, losses };
}

/**
 * Given a conference and season, return an array of {team, wins, losses}
 * for all teams in that conference.
 */
async function getConferenceRecords(
  conference: string,
  season: number
): Promise<Array<{ team: any; wins: number; losses: number }>> {
  const teamsData = await api.getTeams();
  const conferenceTeams = teamsData.data.filter(
    (t: any) => t.conference.toLowerCase() === conference.toLowerCase()
  );

  const records: Array<{ team: any; wins: number; losses: number }> = [];

  for (const team of conferenceTeams) {
    const { wins, losses } = await getTeamRecord(team.id, season);
    records.push({ team, wins, losses });
  }

  return records;
}

/**
 * Tool: get_team_record_and_standing
 * Purpose: Given a team's full name and a season, determine their W-L record and approximate standing among their conference.
 */
export const getTeamRecordAndStandingToolDefinition = {
  name: 'get_team_record_and_standing',
  description:
    "Given a team name and a season, returns the team's W-L record and approximate standing in their conference.",
  parameters: z
    .object({
      team_name: z
        .string()
        .describe('The full name of the team, e.g., "Golden State Warriors".'),
      season: z.number().describe('The NBA season year to query, e.g., 2022.'),
    })
    .describe(
      'Input parameters for retrieving a team’s win-loss record and standing in their conference for a specific NBA season.'
    ),
  strict: true,
};

type GetTeamRecordAndStandingArgs = z.infer<
  typeof getTeamRecordAndStandingToolDefinition.parameters
>;

export const getTeamRecordAndStandingTool: ToolFn<
  GetTeamRecordAndStandingArgs,
  string
> = async ({ toolArgs }) => {
  const { team_name, season } = toolArgs;

  // 1. Find team by name
  const teamsData = await api.getTeams();

  const team = teamsData.data.find(
    (t: any) => t.full_name.toLowerCase() === team_name.toLowerCase()
  );

  if (!team) {
    return `No team found with the name "${team_name}".`;
  }

  // 2. Get this team's record
  const { wins, losses } = await getTeamRecord(team.id, season);

  // 3. Get conference records for all teams in the same conference
  const conferenceRecords = await getConferenceRecords(team.conference, season);

  // 4. Sort conference teams by wins (descending), then by losses (ascending)
  conferenceRecords.sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    } else {
      return a.losses - b.losses;
    }
  });

  // 5. Find the standing of the team
  const standing =
    conferenceRecords.findIndex((r) => r.team.id === team.id) + 1;

  // 6. Return a nice summary
  const summary = {
    team: team.full_name,
    season,
    record: `${wins}-${losses}`,
    conference: team.conference,
    approximate_standing: standing, // standing in their conference
  };

  return JSON.stringify(summary, null, 2);
};

async function fetchAllTeamGamesForSeason(
  teamId: number,
  season: number
): Promise<any[]> {
  const cacheKey = `${teamId}-${season}`;
  if (teamSeasonGamesCache.has(cacheKey)) {
    return teamSeasonGamesCache.get(cacheKey)!;
  }

  let allGames: any[] = [];
  let cursor: number | undefined = undefined;

  const end_date = new Date().toISOString().split('T')[0]; // today

  while (true) {
    const response = await api.getGames({
      team_ids: [teamId],
      seasons: [season],
      cursor,
      end_date,
      per_page: 100, // max allowed, reduces total requests
    });

    allGames = allGames.concat(response.data);

    // Check if there is a next_cursor
    if (!response.meta || typeof response.meta.next_cursor === 'undefined') {
      break;
    }

    // Update cursor for next iteration
    cursor = response.meta.next_cursor;
  }

  teamSeasonGamesCache.set(cacheKey, allGames);
  return allGames;
}

// Compute average points scored and allowed for a team in a given season
async function getTeamPointsAverages(
  teamId: number,
  season: number
): Promise<{ avgPointsScored: number; avgPointsAllowed: number }> {
  const games = await fetchAllTeamGamesForSeason(teamId, season);

  let totalScored = 0;
  let totalAllowed = 0;
  let gameCount = 0;

  for (const game of games) {
    const { home_team, visitor_team, home_team_score, visitor_team_score } =
      game;
    if (home_team.id === teamId) {
      totalScored += home_team_score;
      totalAllowed += visitor_team_score;
    } else if (visitor_team.id === teamId) {
      totalScored += visitor_team_score;
      totalAllowed += home_team_score;
    }
    gameCount++;
  }

  if (gameCount === 0) return { avgPointsScored: 0, avgPointsAllowed: 0 };

  return {
    avgPointsScored: totalScored / gameCount,
    avgPointsAllowed: totalAllowed / gameCount,
  };
}

/**
 * Tool: get_betting_insights_for_matchup
 * Purpose: Given two team names and a season, approximate some betting-related insights (like a hypothetical total points line and which team might be favored based on scoring margins).
 *
 * Method:
 *  - Find team IDs for both teams.
 *  - Compute their average points scored and allowed for that season.
 *  - Combine these averages to guess a total points line (e.g., average of Team A’s scored vs Team B’s allowed and vice versa).
 *  - Compare their scoring margins to see who might be "favored."
 */
export const getBettingInsightsForMatchupToolDefinition = {
  name: 'get_betting_insights_for_matchup',
  description: `Given two team names and a season, returns hypothetical betting insights, including estimated total points line and which team might be favored based on historical data.`,
  parameters: z
    .object({
      team_name_a: z
        .string()
        .describe('The full name of team A, e.g., "Golden State Warriors".'),
      team_name_b: z
        .string()
        .describe('The full name of team B, e.g., "Boston Celtics".'),
      season: z.number().describe('The NBA season year to query, e.g., 2022.'),
    })
    .describe(
      'Input parameters for retrieving betting-related insights, including estimated total points line and likely favorite, for a matchup between two teams during a specific NBA season.'
    ),
  strict: true,
};
type GetBettingInsightsForMatchupArgs = z.infer<
  typeof getBettingInsightsForMatchupToolDefinition.parameters
>;

export const getBettingInsightsForMatchupTool: ToolFn<
  GetBettingInsightsForMatchupArgs,
  string
> = async ({ toolArgs }) => {
  const { team_name_a, team_name_b, season } = toolArgs;

  // Get all teams
  const teamsData = await api.getTeams();
  const teamA = teamsData.data.find(
    (t: any) => t.full_name.toLowerCase() === team_name_a.toLowerCase()
  );
  const teamB = teamsData.data.find(
    (t: any) => t.full_name.toLowerCase() === team_name_b.toLowerCase()
  );

  if (!teamA) return `No team found with the name "${team_name_a}".`;
  if (!teamB) return `No team found with the name "${team_name_b}".`;

  // Get averages
  const teamAAverages = await getTeamPointsAverages(teamA.id, season);
  const teamBAverages = await getTeamPointsAverages(teamB.id, season);

  const { avgPointsScored: aScored, avgPointsAllowed: aAllowed } =
    teamAAverages;
  const { avgPointsScored: bScored, avgPointsAllowed: bAllowed } =
    teamBAverages;

  // Hypothetical total line:
  // One simplistic approach: average of (Team A scored vs Team B allowed) and (Team B scored vs Team A allowed)
  // This is just one crude method; you might choose another.
  const estTeamAScore = (aScored + bAllowed) / 2;
  const estTeamBScore = (bScored + aAllowed) / 2;
  const estTotal = estTeamAScore + estTeamBScore;

  // Identify likely favorite:
  // Compare average scoring margins (points scored - points allowed)
  const teamAMargin = aScored - aAllowed;
  const teamBMargin = bScored - bAllowed;

  let favorite = '';
  if (teamAMargin > teamBMargin) {
    favorite = teamA.full_name;
  } else if (teamBMargin > teamAMargin) {
    favorite = teamB.full_name;
  } else {
    favorite = 'No clear favorite (both have similar margins)';
  }

  const result = {
    season,
    teamA: {
      name: teamA.full_name,
      avgPointsScored: aScored,
      avgPointsAllowed: aAllowed,
      margin: teamAMargin,
    },
    teamB: {
      name: teamB.full_name,
      avgPointsScored: bScored,
      avgPointsAllowed: bAllowed,
      margin: teamBMargin,
    },
    estimated_total_points_line: estTotal.toFixed(1),
    estimated_score_teamA: estTeamAScore.toFixed(1),
    estimated_score_teamB: estTeamBScore.toFixed(1),
    likely_favorite: favorite,
  };

  return JSON.stringify(result, null, 2);
};
