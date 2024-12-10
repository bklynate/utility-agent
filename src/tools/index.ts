import { currentLocationToolDefinition } from './currentLocation';
import { currentWeatherToolDefinition } from './weather/currentWeather';
import { queryGoogleToolDefinition } from './webScraper/queryGoogle';

export const tools = [queryGoogleToolDefinition, currentWeatherToolDefinition, currentLocationToolDefinition];
