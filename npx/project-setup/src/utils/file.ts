import { readFileSync, readdirSync, existsSync, copyFileSync, mkdirSync, statSync } from 'fs';
import { join, basename, dirname, extname } from 'path';
import yaml from 'js-yaml';
import { ScriptConfig, FileOperation } from '../types';
import { ConsoleUtils } from './console';

export class FileUtils {
  static parseScriptFile(scriptPath: string): ScriptConfig {
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
      throw new Error(
        `Failed to parse script file '${basename(scriptPath)}': ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static getScriptFiles(scriptsDir: string): string[] {
    if (!existsSync(scriptsDir)) {
      return [];
    }

    return readdirSync(scriptsDir)
      .filter(file => {
        const ext = extname(file).toLowerCase();
        return ext === '.json' || ext === '.yaml' || ext === '.yml';
      })
      .sort();
  }

  static findScriptFile(scriptsDir: string, scriptName: string): string | null {
    const extensions = ['.json', '.yaml', '.yml'];
    
    for (const ext of extensions) {
      const scriptPath = join(scriptsDir, `${scriptName}${ext}`);
      if (existsSync(scriptPath)) {
        return scriptPath;
      }
    }
    
    return null;
  }

  static async copyFiles(fileOperations: FileOperation[], targetDir: string, setupsDir: string): Promise<void> {
    for (let i = 0; i < fileOperations.length; i++) {
      const fileOp = fileOperations[i];
      const sourcePath = join(setupsDir, fileOp.source);
      const destPath = join(targetDir, fileOp.destination);

      ConsoleUtils.progress(i + 1, fileOperations.length, '');
      ConsoleUtils.fileOperation(fileOp.source, fileOp.destination);

      // Validate source exists
      if (!existsSync(sourcePath)) {
        throw new Error(`Source file or directory not found: ${sourcePath}`);
      }

      try {
        // Create destination directory if needed
        const destDir = dirname(destPath);
        if (fileOp.createDir || !existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
          ConsoleUtils.dim(`    Created directory: ${destDir}`);
        }

        // Check if source is a directory or file
        const sourceStat = statSync(sourcePath);
        if (sourceStat.isDirectory()) {
          this.copyDirectory(sourcePath, destPath);
          ConsoleUtils.dim('    Directory copied successfully');
        } else {
          copyFileSync(sourcePath, destPath);
          ConsoleUtils.dim('    File copied successfully');
        }
      } catch (error) {
        throw new Error(
          `Failed to copy ${fileOp.source} to ${fileOp.destination}: ${
            error instanceof Error ? error.message : error
          }`
        );
      }
    }
  }

  static copyDirectory(srcDir: string, destDir: string): void {
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

  static validateDirectoryExists(path: string, name: string): void {
    if (!existsSync(path)) {
      ConsoleUtils.error(`${name} directory not found at: ${path}`);
      process.exit(1);
    }
  }
}