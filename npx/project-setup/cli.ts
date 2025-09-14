#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createRunCommand } from './src/commands/run';
import { createListCommand } from './src/commands/list';
import { createInfoCommand } from './src/commands/info';
import { ConsoleUtils } from './src/utils/console';

const program = new Command();

// Configure main program
program
  .name('webdev-setup')
  .description('CLI tool for setting up web development projects with commands and file operations')
  .version('1.0.0');

// Add commands
program.addCommand(createRunCommand());
program.addCommand(createListCommand());
program.addCommand(createInfoCommand());

// Handle unknown commands
program.on('command:*', function (operands) {
  ConsoleUtils.error(`Unknown command: ${operands[0]}`);
  console.log(`Available commands: ${chalk.cyan('run')}, ${chalk.cyan('list')}, ${chalk.cyan('info')}`);
  process.exit(1);
});

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  console.log(chalk.bold.cyan('\n🛠️  WebDev Setup CLI\n'));
  program.outputHelp();
  console.log(chalk.dim('\nGet started:'));
  console.log(chalk.dim('  webdev-setup list          # List available scripts'));
  console.log(chalk.dim('  webdev-setup info <script> # Show script details'));
  console.log(chalk.dim('  webdev-setup run <script>  # Run a setup script\n'));
}

// Handle global errors
process.on('uncaughtException', (error) => {
  ConsoleUtils.error('Unexpected error occurred:');
  console.error(error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  ConsoleUtils.error('Unhandled promise rejection:');
  console.error(reason);
  process.exit(1);
});

program.parse();