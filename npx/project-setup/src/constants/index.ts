export const SUPPORTED_SCRIPT_EXTENSIONS = ['.json', '.yaml', '.yml'] as const;

export const DEFAULT_DIRECTORIES = {
  SCRIPTS: 'scripts',
  SETUPS: 'setups'
} as const;

export const ERROR_CODES = {
  SCRIPT_NOT_FOUND: 1,
  INVALID_ARGUMENTS: 2,
  DIRECTORY_NOT_FOUND: 3,
  EXECUTION_FAILED: 4,
  VALIDATION_FAILED: 5,
  UNKNOWN_ERROR: 99
} as const;

export const SPINNER_OPTIONS = {
  color: 'cyan' as const,
  spinner: 'dots' as const
};

export const VALIDATION_RULES = {
  MAX_SCRIPT_NAME_LENGTH: 50,
  MAX_OUTPUT_LENGTH: 500,
  SCRIPT_NAME_PATTERN: /^[a-zA-Z0-9_-]+$/
} as const;

export const MESSAGES = {
  SUCCESS: {
    SCRIPT_COMPLETED: (name: string) => `Setup '${name}' completed successfully!`,
    COMMAND_EXECUTED: 'Command completed successfully',
    FILE_COPIED: 'File copied successfully',
    DIRECTORY_COPIED: 'Directory copied successfully',
    ARGUMENTS_VALIDATED: 'Arguments validated successfully'
  },
  ERROR: {
    SCRIPT_NOT_FOUND: (name: string) => `Script '${name}' not found. Use 'project-setup list' to see available scripts.`,
    DIRECTORY_NOT_FOUND: (name: string, path: string) => `${name} directory not found at: ${path}`,
    MISSING_ARGUMENTS: 'Missing required arguments',
    INVALID_TARGET: (path: string) => `Target directory '${path}' does not exist`,
    COMMAND_FAILED: (cmd: string, error: string) => `Command failed: ${cmd}\nError: ${error}`,
    FILE_COPY_FAILED: (src: string, dest: string, error: string) => `Failed to copy ${src} to ${dest}: ${error}`
  },
  INFO: {
    SCRIPT_COUNT: (count: number) => `Found ${count} script${count === 1 ? '' : 's'} available`,
    LOADING_SCRIPTS: 'Loading available scripts...',
    INITIALIZING: 'Initializing script runner...',
    EXECUTING_COMMANDS: 'Executing commands...',
    COPYING_FILES: 'Copying files...'
  }
} as const;