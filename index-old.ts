import 'dotenv/config';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';
import { runAgent } from './src/agent';
import { tools } from './src/tools';

// ASCII Art Intro
const showIntro = () => {
  console.log(
    chalk.blueBright(
      figlet.textSync('Agent CLI', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );

  console.log(
    chalk.hex('#FFA500')(
      boxen(
        'Welcome to the Agent CLI!\nType "exit" to stop at any time.\nLet\'s get started!',
        {
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: '#FFA500',
          align: 'center',
        }
      )
    )
  );
};

/**
 * Function to handle user interactions in a continuous loop
 */
const startChat = async () => {
  showIntro(); // Show ASCII Art and Welcome Message

  console.log(
    chalk.green("Hello! I'm your assistant. How can I help you today?\n")
  );

  while (true) {
    try {
      // Prompt the user for input
      const { userMessage } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userMessage',
          message: chalk.blue('>> '),
          theme: {
            
          }
        },
      ]);

      // Check for exit command
      if (userMessage.toLowerCase() === 'exit') {
        console.log(chalk.yellow.bold('\nGoodbye! Have a great day!'));
        process.exit(0);
      }

      if (!userMessage.trim()) {
        console.log(chalk.red.bold('Please provide a valid message.'));
        continue;
      }

      // Process the user's message with the agent
      const response = await runAgent({
        userMessage,
        tools,
      });

      if (response && response.length > 0) {
        const assistantMessage = response
          .filter((msg) => msg.role === 'assistant')
          .map((msg) => msg.content)
          .join('\n\n');

        console.log(
          chalk.hex('#66ff66')(
            boxen(assistantMessage, {
              padding: 1,
              margin: 1,
              borderStyle: 'round',
              borderColor: '#66ff66',
            })
          )
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.redBright.bold('Error:'), error.message);
      } else {
        console.error(
          chalk.redBright.bold('An unexpected error occurred:'),
          error
        );
      }
    }
  }
};

// Initialize commander for CLI arguments
const program = new Command();
program
  .name('agent-cli')
  .description('CLI to interact with a chatbot. Type "exit" to stop.')
  .version('1.0.0');

// Define the `start` command
program
  .command('start')
  .description('Start the chatbot assistant')
  .action(() => {
    startChat();
  });

// Auto-run if no CLI arguments are provided
if (!process.argv.slice(2).length) {
  startChat();
} else {
  program.parse(process.argv);
}
