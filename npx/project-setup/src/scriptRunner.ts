import { existsSync } from 'fs';
import { join } from 'path';
import { ScriptConfig, ScriptInfo, ScriptListItem } from './types';
import { ConsoleUtils } from './utils/console';
import { FileUtils } from './utils/file';
import { ScriptUtils } from './utils/script';

export class ScriptRunner {
  constructor(
    private scriptsDir: string,
    private setupsDir: string
  ) {}

  async executeScript(scriptName: string, targetDir: string, args: string[] = []): Promise<void> {
    const scriptPath = FileUtils.findScriptFile(this.scriptsDir, scriptName);
    if (!scriptPath) {
      throw new Error(`Script '${scriptName}' not found. Use 'webdev-setup list' to see available scripts.`);
    }

    ConsoleUtils.title(`🚀 Running script: ${scriptName}`);
    ConsoleUtils.info(`Target directory: ${targetDir}`);
    
    if (args.length > 0) {
      ConsoleUtils.info(`Arguments: ${args.join(', ')}`);
    }
    
    // Parse and validate script configuration
    const config = FileUtils.parseScriptFile(scriptPath);
    ScriptUtils.validateArguments(config, args);
    const processedConfig = ScriptUtils.processArguments(config, args);
    
    // Validate target directory exists
    if (!existsSync(targetDir)) {
      throw new Error(`Target directory '${targetDir}' does not exist`);
    }

    // Execute commands
    if (processedConfig.commands && processedConfig.commands.length > 0) {
      ConsoleUtils.subtitle('📋 Executing commands...');
      await ScriptUtils.executeCommands(processedConfig.commands, targetDir);
    }

    // Copy files
    if (processedConfig.files && processedConfig.files.length > 0) {
      ConsoleUtils.subtitle('📁 Copying files...');
      await FileUtils.copyFiles(processedConfig.files, targetDir, this.setupsDir);
    }
  }

  listAvailableScripts(): ScriptListItem[] {
    if (!existsSync(this.scriptsDir)) {
      return [];
    }

    const scriptFiles = FileUtils.getScriptFiles(this.scriptsDir);
    const scripts: ScriptListItem[] = [];

    for (const file of scriptFiles) {
      try {
        const scriptPath = join(this.scriptsDir, file);
        const config = FileUtils.parseScriptFile(scriptPath);
        
        scripts.push({
          name: config.name,
          description: config.description,
          args: config.args
        });
      } catch (error) {
        ConsoleUtils.warning(`Could not parse script '${file}': ${error}`);
      }
    }

    return scripts.sort((a, b) => a.name.localeCompare(b.name));
  }

  getScriptInfo(scriptName: string): ScriptInfo {
    const scriptPath = FileUtils.findScriptFile(this.scriptsDir, scriptName);
    if (!scriptPath) {
      throw new Error(`Script '${scriptName}' not found`);
    }

    const config = FileUtils.parseScriptFile(scriptPath);
    
    return {
      name: config.name,
      description: config.description,
      args: config.args,
      commands: config.commands,
      files: config.files,
      argCount: config.args ? Object.keys(config.args).length : 0
    };
  }
}