import { existsSync, statSync } from 'fs';
import { ScriptConfig } from '../types';
import { ConsoleUtils } from './console';

export class ValidationUtils {
  static validateScriptConfig(config: ScriptConfig): void {
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('Script configuration must have a valid name');
    }

    if (config.description && typeof config.description !== 'string') {
      throw new Error('Script description must be a string');
    }

    if (config.args && typeof config.args !== 'object') {
      throw new Error('Script args must be an object');
    }

    if (config.commands && !Array.isArray(config.commands)) {
      throw new Error('Script commands must be an array');
    }

    if (config.files && !Array.isArray(config.files)) {
      throw new Error('Script files must be an array');
    }

    // Validate file operations
    if (config.files) {
      config.files.forEach((fileOp, index) => {
        if (!fileOp.source || typeof fileOp.source !== 'string') {
          throw new Error(`File operation ${index + 1}: source must be a non-empty string`);
        }

        if (!fileOp.destination || typeof fileOp.destination !== 'string') {
          throw new Error(`File operation ${index + 1}: destination must be a non-empty string`);
        }

        if (fileOp.createDir !== undefined && typeof fileOp.createDir !== 'boolean') {
          throw new Error(`File operation ${index + 1}: createDir must be a boolean`);
        }
      });
    }
  }

  static validateTargetDirectory(targetDir: string): void {
    if (!existsSync(targetDir)) {
      throw new Error(`Target directory '${targetDir}' does not exist`);
    }

    const stat = statSync(targetDir);
    if (!stat.isDirectory()) {
      throw new Error(`Target path '${targetDir}' is not a directory`);
    }

    // Check if directory is writable (basic check)
    try {
      // This is a simple check - in a real scenario you might want more sophisticated permission checking
      const testPath = `${targetDir}/.project-setup-test`;
      require('fs').writeFileSync(testPath, 'test');
      require('fs').unlinkSync(testPath);
    } catch {
      ConsoleUtils.warning(`Target directory '${targetDir}' may not be writable`);
    }
  }

  static validateScriptName(scriptName: string): void {
    if (!scriptName || typeof scriptName !== 'string') {
      throw new Error('Script name must be a non-empty string');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(scriptName)) {
      throw new Error('Script name can only contain letters, numbers, underscores, and hyphens');
    }

    if (scriptName.length > 50) {
      throw new Error('Script name must be 50 characters or less');
    }
  }

  static validateArguments(args: string[]): void {
    args.forEach((arg, index) => {
      if (typeof arg !== 'string') {
        throw new Error(`Argument ${index + 1} must be a string`);
      }

      if (arg.trim().length === 0) {
        ConsoleUtils.warning(`Argument ${index + 1} is empty or contains only whitespace`);
      }
    });
  }
}