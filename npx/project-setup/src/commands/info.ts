import { Command } from 'commander';
import { join } from 'path';
import { ScriptRunner } from '../scriptRunner';
import { ConsoleUtils } from '../utils/console';
import { FileUtils } from '../utils/file';
import { ERROR_CODES } from '../constants';

export function createInfoCommand(): Command {
  return new Command('info')
    .description('Show detailed information about a specific script')
    .argument('<scriptName>', 'Name of the script to get information about')
    .action((scriptName: string) => {
      const spinner = ConsoleUtils.createSpinner(`Loading script information for '${scriptName}'...`);
      spinner.start();

      try {
        const scriptsDir = join(__dirname, '..', 'scripts');

        FileUtils.validateDirectoryExists(scriptsDir, 'Scripts');

        const runner = new ScriptRunner(scriptsDir, '');
        const info = runner.getScriptInfo(scriptName);

        spinner.succeed('Script information loaded');

        ConsoleUtils.title(`📄 Script: ${info.name}`);
        
        if (info.description) {
          ConsoleUtils.subtitle('Description:');
          ConsoleUtils.dim(info.description);
          ConsoleUtils.separator();
        }

        if (info.args && Object.keys(info.args).length > 0) {
          ConsoleUtils.subtitle('Required Arguments:');
          Object.entries(info.args).forEach(([argName, description], index) => {
            ConsoleUtils.listItem(`ARG-${index + 1} (${argName})`, description);
          });

          const argNames = Object.keys(info.args);
          const argPlaceholders = argNames.map((_, i) => `<arg${i + 1}>`).join(' ');
          ConsoleUtils.usage(`project-setup run ${scriptName} ${argPlaceholders}`);
        } else {
          ConsoleUtils.usage(`project-setup run ${scriptName}`);
        }

        if (info.commands && info.commands.length > 0) {
          ConsoleUtils.subtitle('Commands to execute:');
          info.commands.forEach((cmd, i) => {
            ConsoleUtils.dim(`  ${i + 1}. `);
            ConsoleUtils.command(cmd);
          });
          ConsoleUtils.separator();
        }

        if (info.files && info.files.length > 0) {
          ConsoleUtils.subtitle('Files to copy:');
          info.files.forEach((file, i) => {
            ConsoleUtils.dim(`  ${i + 1}. `);
            ConsoleUtils.fileOperation(file.source, file.destination);
          });
          ConsoleUtils.separator();
        }

        // Summary
        const summary = [];
        if (info.commands?.length) {
          summary.push(`${info.commands.length} command${info.commands.length === 1 ? '' : 's'}`);
        }
        if (info.files?.length) {
          summary.push(`${info.files.length} file${info.files.length === 1 ? '' : 's'}`);
        }
        if (info.argCount) {
          summary.push(`${info.argCount} argument${info.argCount === 1 ? '' : 's'}`);
        }

        if (summary.length > 0) {
          ConsoleUtils.info(`This script includes: ${summary.join(', ')}`);
        }
      } catch (error) {
        spinner.fail('Failed to load script information');
        ConsoleUtils.error(error instanceof Error ? error.message : String(error));
        process.exit(ERROR_CODES.SCRIPT_NOT_FOUND);
      }
    });
}