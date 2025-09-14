import { Command } from 'commander';
import { join } from 'path';
import { ScriptRunner } from '../scriptRunner';
import { ConsoleUtils } from '../utils/console';
import { FileUtils } from '../utils/file';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all available setup scripts')
    .action(() => {
      const spinner = ConsoleUtils.createSpinner('Loading available scripts...');
      spinner.start();

      try {
        const scriptsDir = join(__dirname, '..', 'scripts');
        
        FileUtils.validateDirectoryExists(scriptsDir, 'Scripts');
        
        const runner = new ScriptRunner(scriptsDir, '');
        const scripts = runner.listAvailableScripts();

        spinner.succeed('Scripts loaded successfully');

        if (scripts.length === 0) {
          ConsoleUtils.warning('No setup scripts found in scripts directory');
          return;
        }

        ConsoleUtils.title('📋 Available setup scripts:');
        ConsoleUtils.separator();

        scripts.forEach((script) => {
          ConsoleUtils.listItem(script.name, script.description);
          
          if (script.args && Object.keys(script.args).length > 0) {
            ConsoleUtils.dim('    Arguments:');
            Object.entries(script.args).forEach(([key, description]) => {
              ConsoleUtils.dim(`      • ${key}: ${description}`);
            });
          }
          
          ConsoleUtils.separator();
        });

        ConsoleUtils.info(`Found ${scripts.length} script${scripts.length === 1 ? '' : 's'} available`);
      } catch (error) {
        spinner.fail('Failed to load scripts');
        ConsoleUtils.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}