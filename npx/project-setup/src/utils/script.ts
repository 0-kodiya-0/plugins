import { execSync } from 'child_process';
import { ScriptConfig, FileOperation } from '../types';
import { ConsoleUtils } from './console';

export class ScriptUtils {
  static validateArguments(config: ScriptConfig, args: string[]): void {
    if (!config.args) {
      return; // No arguments required
    }

    const requiredArgCount = Object.keys(config.args).length;
    const providedArgCount = args.length;

    if (providedArgCount < requiredArgCount) {
      ConsoleUtils.subtitle('Missing required arguments:');
      
      const argEntries = Object.entries(config.args);
      for (let i = 0; i < argEntries.length; i++) {
        const [argName, description] = argEntries[i];
        const argNumber = i + 1;
        const status = i < providedArgCount ? 'success' : 'error';
        const value = i < providedArgCount ? `"${args[i]}"` : 'MISSING';
        
        ConsoleUtils.argument(`ARG-${argNumber} (${argName})`, value, status);
        ConsoleUtils.dim(`    ${description}`);
        ConsoleUtils.separator();
      }
      
      ConsoleUtils.error(`Expected ${requiredArgCount} arguments, but received ${providedArgCount}`);
      
      const argPlaceholders = argEntries.map((_, i) => `<arg${i + 1}>`).join(' ');
      ConsoleUtils.usage(`project-setup run ${config.name} ${argPlaceholders}`);
      
      throw new Error('Missing required arguments');
    }

    // Log successful argument validation
    if (requiredArgCount > 0) {
      ConsoleUtils.subtitle('Arguments validated successfully');
      const argEntries = Object.entries(config.args);
      for (let i = 0; i < argEntries.length; i++) {
        const [argName] = argEntries[i];
        ConsoleUtils.argument(`ARG-${i + 1} (${argName})`, `"${args[i]}"`);
      }
    }
  }

  static processArguments(config: ScriptConfig, args: string[]): ScriptConfig {
    if (!config.args || args.length === 0) {
      return config;
    }

    // Deep clone the configuration to avoid modifying the original
    const processedConfig = JSON.parse(JSON.stringify(config));

    // Process commands
    if (processedConfig.commands) {
      processedConfig.commands = processedConfig.commands.map((command: string) => 
        this.replaceArgPlaceholders(command, args)
      );
    }

    // Process file operations
    if (processedConfig.files) {
      processedConfig.files = processedConfig.files.map((fileOp: FileOperation) => ({
        ...fileOp,
        source: this.replaceArgPlaceholders(fileOp.source, args),
        destination: this.replaceArgPlaceholders(fileOp.destination, args)
      }));
    }

    return processedConfig;
  }

  static replaceArgPlaceholders(text: string, args: string[]): string {
    let result = text;
    
    // Replace ARG-1, ARG-2, etc. with corresponding argument values
    for (let i = 0; i < args.length; i++) {
      const placeholder = `ARG-${i + 1}`;
      const regex = new RegExp(placeholder, 'g');
      result = result.replace(regex, args[i]);
    }
    
    return result;
  }

  static async executeCommands(commands: string[], targetDir: string): Promise<void> {
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      ConsoleUtils.progress(i + 1, commands.length, '');
      ConsoleUtils.command(command);
      
      const spinner = ConsoleUtils.createSpinner('Executing command...');
      spinner.start();
      
      try {
        const output = execSync(command, {
          cwd: targetDir,
          stdio: 'pipe',
          encoding: 'utf-8'
        });
        
        spinner.succeed('Command completed successfully');
        
        // Show output if it's not too long
        if (output && output.trim() && output.length < 500) {
          ConsoleUtils.dim(`Output: ${output.trim()}`);
        }
      } catch (error: any) {
        const errorMsg = error.stderr || error.message || 'Unknown error';
        spinner.fail('Command failed');
        ConsoleUtils.error(errorMsg);
        throw new Error(`Command failed: ${command}\nError: ${errorMsg}`);
      }
    }
  }
}