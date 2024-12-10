import { z } from 'zod';
import NBA from 'nba';
import type { ToolFn } from 'types';

// Helper function to create Tool Definitions with descriptions
const createToolDefinition = (
  name: string,
  description: string,
  schema: z.ZodTypeAny
) => ({
  name,
  description,
  parameters: schema,
});

// const curry = NBA.findPlayer('Stephen Curry');
// console.log(curry);

// const curryStats = await NBA.stats.playerInfo({ PlayerID: curry.playerId });

// console.log(curryStats);

// const warriorsTeamId = await NBA.teamIdFromName('warriors');
const scoreboard = await NBA.data.standings();

// console.log(warriorsTeamId);
console.log(scoreboard);



// Helper function to create Tool Functions
// const createToolFn =
//   <T extends z.ZodTypeAny>(
//     methodName: keyof typeof nba.stats | keyof typeof nba.data,
//     schema: T
//   ): ToolFn<z.infer<T>, any> =>
//   async ({ toolArgs }) => {
//     const method =
//       nba.stats[methodName as keyof typeof nba.stats] ||
//       nba.data[methodName as keyof typeof nba.data];

//     // Ensure the method is a valid function
//     if (typeof method !== 'function') {
//       throw new Error(`Method "${methodName}" not found in nba.stats or nba.data`);
//     }

//     try {
//       // Execute the method with the provided arguments
//       const res = await method(toolArgs);
//       return res;
//     } catch (error) {
//       // Wrap and rethrow any error with additional context
//       if (error instanceof Error) {
//         throw new Error(`Error executing method "${methodName}": ${error.message}`);
//       }
//     }
//   };

// playByPlay Tool Definition
// export const playByPlayToolDefinition = createToolDefinition(
//   'play_by_play',
//   'Retrieves detailed play-by-play data for a specific game, covering all actions within specified periods.',
//   z
//     .object({
//       GameID: z
//         .string()
//         .describe(
//           'The unique identifier for the NBA game. Example: "0021500001".'
//         ),
//       StartPeriod: z
//         .string()
//         .default('1')
//         .describe(
//           'The starting period for the play-by-play data. Example: "1" for the first quarter.'
//         ),
//       EndPeriod: z
//         .string()
//         .default('4')
//         .describe(
//           'The ending period for the play-by-play data. Example: "4" for the fourth quarter.'
//         ),
//     })
//     .describe(
//       'Input parameters for fetching play-by-play data, including game ID and period range.'
//     )
// );

// export const playByPlay = createToolFn(
//   'playByPlay',
//   playByPlayToolDefinition.parameters
// )
