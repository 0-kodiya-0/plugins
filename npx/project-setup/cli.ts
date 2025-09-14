#!/usr/bin/env node

import { Command } from 'commander';
import { ScriptRunner } from './src/scriptRunner';
import { join } from 'path';
import { existsSync } from 'fs';

const program = new Command();

program
  .name('webdev-setup')
  .description('CLI tool for setting up web development projects with commands and file operations')
  .version('1.0.0');

program
  .command('run <scriptName> [args...]')
  .description('Run a setup script with optional arguments')
  .option('-t, --target <path>', 'Target directory for the setup', process.cwd())
  .action(async (scriptName: string, args: string[], options: { target: string }) => {
    try {
      const scriptsDir = join(__dirname, 'src', 'scripts');
      const setupsDir = join(__dirname, 'src', 'setups');

      // Validate directories exist
      if (!existsSync(scriptsDir)) {
        console.error('Scripts directory not found at:', scriptsDir);
        process.exit(1);
      }

      if (!existsSync(setupsDir)) {
        console.error('Setups directory not found at:', setupsDir);
        process.exit(1);
      }

      // Create and run script runner
      const runner = new ScriptRunner(scriptsDir, setupsDir);
      await runner.executeScript(scriptName, options.target, args);

      console.log(`\nSetup '${scriptName}' completed successfully!`);
    } catch (error) {
      console.error('\nError:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all available setup scripts')
  .action(() => {
    try {
        const scriptsDir = join(__dirname, 'src', 'scripts');
        
        console.log(scriptsDir)

      if (!existsSync(scriptsDir)) {
        console.error('Scripts directory not found');
        process.exit(1);
      }

      const runner = new ScriptRunner(scriptsDir, '');
      const scripts = runner.listAvailableScripts();

      if (scripts.length === 0) {
        console.log('No setup scripts found in scripts directory');
        return;
      }

      console.log('Available setup scripts:\n');
      scripts.forEach((script) => {
        console.log(`  ${script.name}`);
        if (script.description) {
          console.log("\n     Description");
          console.log(`     ${script.description}`);
        }
        
        if (script.args) {
          console.log("\n     Arguments Details");
          Object.keys(script.args).forEach((key) => {
            console.log(`     ${key}: ${script.args[key]}`);
          })
        }
        console.log('');
      });
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('info <scriptName>')
  .description('Show detailed information about a specific script')
  .action((scriptName: string) => {
    try {
      const scriptsDir = join(__dirname, 'src', 'scripts');

      if (!existsSync(scriptsDir)) {
        console.error('Scripts directory not found');
        process.exit(1);
      }

      const runner = new ScriptRunner(scriptsDir, '');
      const info = runner.getScriptInfo(scriptName);

      console.log(`Script: ${info.name}`);
      if (info.description) {
        console.log(`Description: ${info.description}`);
      }

      if (info.args && Object.keys(info.args).length > 0) {
        console.log('\nRequired Arguments:');
        Object.entries(info.args).forEach(([argName, description], index) => {
          console.log(`  ARG-${index + 1} (${argName}): ${description}`);
        });

        const argNames = Object.keys(info.args);
        console.log(
          `\nUsage: webdev-setup run ${scriptName} ${argNames.map((_, i) => `<arg${i + 1}>`).join(' ')}`
        );
      } else {
        console.log('\nUsage: webdev-setup run ' + scriptName);
      }

      if (info.commands && info.commands.length > 0) {
        console.log('\nCommands to execute:');
        info.commands.forEach((cmd, i) => {
          console.log(`  ${i + 1}. ${cmd}`);
        });
      }

      if (info.files && info.files.length > 0) {
        console.log('\nFiles to copy:');
        info.files.forEach((file, i) => {
          console.log(`  ${i + 1}. ${file.source} → ${file.destination}`);
        });
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', function (operands) {
  console.error(`Unknown command: ${operands[0]}`);
  console.log('Available commands: run, list, info');
  process.exit(1);
});

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse();
