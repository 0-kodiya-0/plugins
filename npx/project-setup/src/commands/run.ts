import { Command } from 'commander';
import { join } from 'path';
import { ScriptRunner } from '../scriptRunner';
import { CommandOptions } from '../types';
import { ConsoleUtils } from '../utils/console';
import { FileUtils } from '../utils/file';
import { ERROR_CODES, MESSAGES } from '../constants';

export function createRunCommand(): Command {
  return new Command('run')
    .description('Run a setup script with optional arguments')
    .argument('<scriptName>', 'Name of the script to run')
    .argument('[args...]', 'Arguments to pass to the script')
    .option('-t, --target <path>', 'Target directory for the setup', process.cwd())
    .action(async (scriptName: string, args: string[], options: CommandOptions) => {
      const spinner = ConsoleUtils.createSpinner(MESSAGES.INFO.INITIALIZING);
      spinner.start();

      try {
        const scriptsDir = join(__dirname, '..', 'scripts');
        const setupsDir = join(__dirname, '..', 'setups');

        // Validate directories exist
        FileUtils.validateDirectoryExists(scriptsDir, 'Scripts');
        FileUtils.validateDirectoryExists(setupsDir, 'Setups');

        spinner.succeed('Script runner initialized');

        // Create and run script runner
        const runner = new ScriptRunner(scriptsDir, setupsDir);
        await runner.executeScript(scriptName, options.target, args);

        ConsoleUtils.success(MESSAGES.SUCCESS.SCRIPT_COMPLETED(scriptName));
      } catch (error) {
        spinner.fail('Script execution failed');
        ConsoleUtils.error(error instanceof Error ? error.message : String(error));
        process.exit(ERROR_CODES.EXECUTION_FAILED);
      }
    });
}