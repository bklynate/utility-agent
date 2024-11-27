import type OpenAI from 'openai';
import { queryGoogle } from '@tools/queryGoogle/queryGoogle';
// Map of tool functions
const toolFunctions: Record<string, Function> = {
  query_google: queryGoogle,
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

  console.log(`Running tool: ${toolCall.function.name}`);

  try {
    const response = await toolFunction(input);
    console.log(`Response from ${toolCall.function.name}:`, response);
    return response;
  } catch (error: any) {
    console.error(`Error in tool ${toolCall.function.name}:`, error);
    throw new Error(
      `Error running tool ${toolCall.function.name}: ${error.message}`
    );
  }
};
