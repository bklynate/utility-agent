import 'dotenv/config'
import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { runAgent } from './src/agent'
import { tools } from './src/tools'

// Initialize commander for CLI arguments
const program = new Command()
program
  .name('agent-cli')
  .description('CLI to interact with a chatbot. Type "exit" to stop.')
  .version('1.0.0')

/**
 * Function to handle user interactions in a continuous loop
 */
const startChat = async () => {
  console.log(chalk.green("Hello! I'm your assistant. How can I help you today?"))
  
  while (true) {
    try {
      // Prompt the user for input
      const { userMessage } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userMessage',
          message: chalk.blue('>> '),
          theme: {
            prefix: '',
          }
        },
      ])

      // Check for exit command
      if (userMessage.toLowerCase() === 'exit') {
        console.log(chalk.yellow('Goodbye!'))
        process.exit(0)
      }

      if (!userMessage.trim()) {
        console.log(chalk.red('Please provide a valid message.'))
        continue
      }

      // Process the user's message with the agent
      const response = await runAgent({
        userMessage,
        tools,
      })

      if (response && response.length > 0) {
        const assistantMessage = response
          .filter((msg) => msg.role === 'assistant')
          .map((msg) => msg.content)
          .join('\n\n')

        console.log(chalk.greenBright('\n[ASSISTANT]\n'), assistantMessage, '\n')
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error:'), error.message)
      } else {
        console.error(chalk.red('An unexpected error occurred:'), error)
      }
    }
  }
}

// Define the `start` command
program
  .command('start')
  .description('Start the chatbot assistant')
  .action(() => {
    startChat()
  })

// Auto-run if no CLI arguments are provided
if (!process.argv.slice(2).length) {
  startChat()
} else {
  program.parse(process.argv)
}
