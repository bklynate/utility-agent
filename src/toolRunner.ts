import type OpenAI from 'openai';
import { queryGoogle } from '@tools/webScraper/queryGoogle';
import { currentWeather } from '@tools/weather';
import { currentLocationTool } from '@src/tools/currentLocation';
import {
  getAllTeamsTool,
  getTeamByIdTool,
  getAllPlayersTool,
  getPlayerByIdTool,
  getAllGamesTool,
  getGameByIdTool,
  getPlayersByTeamNameTool,
  getTeamOfPlayerTool,
  getGamesForTeamInDateRangeTool,
  getTeamRecordAndStandingTool,
  getBettingInsightsForMatchupTool,
} from '@src/tools/sports/NBA';
import logger from '@utils/logger';

// Map of tool functions
const toolFunctions: Record<string, Function> = {
  query_google: queryGoogle,
  current_weather: currentWeather,
  current_location: currentLocationTool,
  get_all_teams: getAllTeamsTool,
  get_team_by_id: getTeamByIdTool,
  get_all_players: getAllPlayersTool,
  get_player_by_id: getPlayerByIdTool,
  get_all_games: getAllGamesTool,
  get_game_by_id: getGameByIdTool,
  get_players_by_team_name: getPlayersByTeamNameTool,
  get_team_of_player: getTeamOfPlayerTool,
  get_games_for_team_in_date_range: getGamesForTeamInDateRangeTool,
  get_team_record_and_standing: getTeamRecordAndStandingTool,
  get_betting_insights_for_matchup: getBettingInsightsForMatchupTool,
};

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments || '{}'),
  };

  const toolFunction = toolFunctions[toolCall.function.name];
  if (!toolFunction) {
    throw new Error(`Tool ${toolCall.function.name} not found`);
  }

  logger.info(`Running tool: ${toolCall.function.name}`);

  try {
    const response = await toolFunction(input);
    return response;
  } catch (error: any) {
    console.error(`Error in tool ${toolCall.function.name}:`, error);
    throw new Error(
      `Error running tool ${toolCall.function.name}: ${error.message}`
    );
  }
};
