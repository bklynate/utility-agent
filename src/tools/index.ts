import { currentWeatherToolDefinition } from './weather/currentWeather';
import { queryGoogleToolDefinition } from './queryGoogle/queryGoogle';

export const tools = [queryGoogleToolDefinition, currentWeatherToolDefinition];
