import { currentLocationToolDefinition } from './currentLocation';
import { currentWeatherToolDefinition } from './weather/currentWeather';
import { queryGoogleToolDefinition } from './webScraper/queryGoogle';
import {
  getAllGamesToolDefinition,
  getAllTeamsToolDefinition,
  getGameByIdToolDefinition,
  getTeamByIdToolDefinition,
  getPlayerByIdToolDefinition,
  getAllPlayersToolDefinition,
  getTeamOfPlayerToolDefinition,
  getPlayersByTeamNameToolDefinition,
  getTeamRecordAndStandingToolDefinition,
  getGamesForTeamInDateRangeToolDefinition,
  getBettingInsightsForMatchupToolDefinition,
} from './sports/NBA';

export const tools = [
  queryGoogleToolDefinition,
  getAllGamesToolDefinition,
  getAllTeamsToolDefinition,
  getGameByIdToolDefinition,
  getTeamByIdToolDefinition,
  getPlayerByIdToolDefinition,
  getAllPlayersToolDefinition,
  currentWeatherToolDefinition,
  getTeamOfPlayerToolDefinition,
  currentLocationToolDefinition,
  getPlayersByTeamNameToolDefinition,
  getTeamRecordAndStandingToolDefinition,
  getGamesForTeamInDateRangeToolDefinition,
  getBettingInsightsForMatchupToolDefinition,
];
