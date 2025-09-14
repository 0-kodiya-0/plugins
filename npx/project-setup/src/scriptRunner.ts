import { readFileSync, readdirSync, existsSync, copyFileSync, mkdirSync, statSync } from 'fs';
import { join, basename, dirname, extname } from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

interface ScriptConfig {
  name: string;
  description?: string;
  args?: Record<string, string>;
  commands?: string[];
  files?: FileOperation[];
}

interface FileOperation {
  source: string;
  destination: string;
  createDir?: boolean;
}

interface ScriptInfo {
  name: string;
  description?: string;
  args?: Record<string, string>;
  commands?: string[];
  files?: FileOperation[];
  argCount: number;
}

interface ScriptListItem {
  name: string;
  description?: string;
  args: Record<string, string> | undefined;
}

export class ScriptRunner {
  constructor(
    private scriptsDir: string,
    private setupsDir: string
  ) {}

  /**
   * Execute a script by name with provided arguments
   */
  async executeScript(scriptName: string, targetDir: string, args: string[] = []): Promise<void> {
    const scriptPath = this.findScriptFile(scriptName);
    if (!scriptPath) {
      throw new Error(`Script '${scriptName}' not found. Use 'webdev-setup list' to see available scripts.`);
    }

    console.log(`Running script: ${scriptName}`);
    console.log(`Target directory: ${targetDir}`);
    
    if (args.length > 0) {
      console.log(`Arguments: ${args.join(', ')}`);
    }
    
    // Parse and validate script configuration
    const config = this.parseScriptFile(scriptPath);
    this.validateArguments(config, args);
    const processedConfig = this.processArguments(config, args);
    
    // Validate target directory exists
    if (!existsSync(targetDir)) {
      throw new Error(`Target directory '${targetDir}' does not exist`);
    }

    // Execute commands
    if (processedConfig.commands && processedConfig.commands.length > 0) {
      console.log('\nExecuting commands...');
      await this.executeCommands(processedConfig.commands, targetDir);
    }

    // Copy files
    if (processedConfig.files && processedConfig.files.length > 0) {
      console.log('\nCopying files...');
      await this.copyFiles(processedConfig.files, targetDir);
    }
  }

  /**
   * List all available scripts with basic info
   */
  listAvailableScripts(): ScriptListItem[] {
    if (!existsSync(this.scriptsDir)) {
      return [];
    }

    const scriptFiles = this.getScriptFiles();
    const scripts: ScriptListItem[] = [];

    for (const file of scriptFiles) {
      try {
        const scriptPath = join(this.scriptsDir, file);
        const config = this.parseScriptFile(scriptPath);
        
        scripts.push({
          name: config.name,
          description: config.description,
          args: config.args
        });
      } catch (error) {
        console.warn(`Warning: Could not parse script '${file}': ${error}`);
      }
    }

    return scripts.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get detailed information about a specific script
   */
  getScriptInfo(scriptName: string): ScriptInfo {
    const scriptPath = this.findScriptFile(scriptName);
    if (!scriptPath) {
      throw new Error(`Script '${scriptName}' not found`);
    }

    const config = this.parseScriptFile(scriptPath);
    
    return {
      name: config.name,
      description: config.description,
      args: config.args,
      commands: config.commands,
      files: config.files,
      argCount: config.args ? Object.keys(config.args).length : 0
    };
  }

  /**
   * Get all script files in the scripts directory
   */
  private getScriptFiles(): string[] {
    return readdirSync(this.scriptsDir)
      .filter(file => {
        const ext = extname(file).toLowerCase();
        return ext === '.json' || ext === '.yaml' || ext === '.yml';
      })
      .sort();
  }

  /**
   * Find script file by name (supports .json, .yaml, .yml extensions)
   */
  private findScriptFile(scriptName: string): string | null {
    const extensions = ['.json', '.yaml', '.yml'];
    
    for (const ext of extensions) {
      const scriptPath = join(this.scriptsDir, `${scriptName}${ext}`);
      if (existsSync(scriptPath)) {
        return scriptPath;
      }
    }
    
    return null;
  }

  /**
   * Parse script file content (JSON or YAML)
   */
  private parseScriptFile(scriptPath: string): ScriptConfig {
    try {
      const content = readFileSync(scriptPath, 'utf-8').trim();
      const ext = extname(scriptPath).toLowerCase();

      if (!content) {
        throw new Error('Script file is empty');
      }

      let config: ScriptConfig;

      if (ext === '.json') {
        config = JSON.parse(content);
      } else {
        config = yaml.load(content) as ScriptConfig;
      }

      // Validate basic structure
      if (!config || typeof config !== 'object') {
        throw new Error('Invalid script configuration format');
      }

      // Set default name from filename if not provided
      if (!config.name) {
        config.name = basename(scriptPath, extname(scriptPath));
      }

      return config;
    } catch (error) {
      throw new Error(`Failed to parse script file '${basename(scriptPath)}': ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Validate that all required arguments are provided
   */
  private validateArguments(config: ScriptConfig, args: string[]): void {
    if (!config.args) {
      return; // No arguments required
    }

    const requiredArgCount = Object.keys(config.args).length;
    const providedArgCount = args.length;

    if (providedArgCount < requiredArgCount) {
      console.error('\nMissing required arguments:\n');
      
      const argEntries = Object.entries(config.args);
      for (let i = 0; i < argEntries.length; i++) {
        const [argName, description] = argEntries[i];
        const argNumber = i + 1;
        const status = i < providedArgCount ? '✅' : '❌';
        const value = i < providedArgCount ? `"${args[i]}"` : 'MISSING';
        
        console.error(`  ${status} ARG-${argNumber} (${argName}): ${description}`);
        console.error(`      Value: ${value}\n`);
      }
      
      console.error(`Expected ${requiredArgCount} arguments, but received ${providedArgCount}`);
      
      const argPlaceholders = argEntries.map((_, i) => `<arg${i + 1}>`).join(' ');
      console.error(`\nUsage: webdev-setup run ${config.name} ${argPlaceholders}\n`);
      
      throw new Error('Missing required arguments');
    }

    // Log successful argument validation
    if (requiredArgCount > 0) {
      console.log('\nArguments validated successfully');
      const argEntries = Object.entries(config.args);
      for (let i = 0; i < argEntries.length; i++) {
        const [argName] = argEntries[i];
        console.log(`  ARG-${i + 1} (${argName}): "${args[i]}"`);
      }
    }
  }

  /**
   * Replace ARG-N placeholders in configuration with actual argument values
   */
  private processArguments(config: ScriptConfig, args: string[]): ScriptConfig {
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

  /**
   * Replace ARG-N placeholders with actual argument values
   */
  private replaceArgPlaceholders(text: string, args: string[]): string {
    let result = text;
    
    // Replace ARG-1, ARG-2, etc. with corresponding argument values
    for (let i = 0; i < args.length; i++) {
      const placeholder = `ARG-${i + 1}`;
      const regex = new RegExp(placeholder, 'g');
      result = result.replace(regex, args[i]);
    }
    
    return result;
  }

  /**
   * Execute shell commands in the target directory
   */
  private async executeCommands(commands: string[], targetDir: string): Promise<void> {
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`\n  ${i + 1}/${commands.length} 🔄 ${command}`);
      
      try {
        const output = execSync(command, {
          cwd: targetDir,
          stdio: 'pipe',
          encoding: 'utf-8'
        });
        
        console.log(`  Command completed successfully`);
        
        // Show output if it's not too long
        if (output && output.trim() && output.length < 500) {
          console.log(`  Output: ${output.trim()}`);
        }
      } catch (error: any) {
        const errorMsg = error.stderr || error.message || 'Unknown error';
        console.error(`  Command failed: ${errorMsg}`);
        throw new Error(`Command failed: ${command}\nError: ${errorMsg}`);
      }
    }
  }

  /**
   * Copy files from setups directory to target directory
   */
  private async copyFiles(fileOperations: FileOperation[], targetDir: string): Promise<void> {
    for (let i = 0; i < fileOperations.length; i++) {
      const fileOp = fileOperations[i];
      const sourcePath = join(this.setupsDir, fileOp.source);
      const destPath = join(targetDir, fileOp.destination);

      console.log(`\n  ${i + 1}/${fileOperations.length} ${fileOp.source} → ${fileOp.destination}`);

      // Validate source exists
      if (!existsSync(sourcePath)) {
        throw new Error(`Source file or directory not found: ${sourcePath}`);
      }

      try {
        // Create destination directory if needed
        const destDir = dirname(destPath);
        if (fileOp.createDir || !existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
          console.log(`  Created directory: ${destDir}`);
        }

        // Check if source is a directory or file
        const sourceStat = statSync(sourcePath);
        if (sourceStat.isDirectory()) {
          this.copyDirectory(sourcePath, destPath);
          console.log(`  Directory copied successfully`);
        } else {
          copyFileSync(sourcePath, destPath);
          console.log(`  File copied successfully`);
        }
      } catch (error) {
        throw new Error(`Failed to copy ${fileOp.source} to ${fileOp.destination}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  /**
   * Recursively copy a directory and its contents
   */
  private copyDirectory(srcDir: string, destDir: string): void {
    // Create destination directory
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    const files = readdirSync(srcDir);

    for (const file of files) {
      const srcPath = join(srcDir, file);
      const destPath = join(destDir, file);
      const stat = statSync(srcPath);

      if (stat.isDirectory()) {
        // Recursively copy subdirectory
        this.copyDirectory(srcPath, destPath);
      } else {
        // Copy file
        copyFileSync(srcPath, destPath);
      }
    }
  }
}