export interface ScriptConfig {
  name: string;
  description?: string;
  args?: Record<string, string>;
  commands?: string[];
  files?: FileOperation[];
}

export interface FileOperation {
  source: string;
  destination: string;
  createDir?: boolean;
}

export interface ScriptInfo {
  name: string;
  description?: string;
  args?: Record<string, string>;
  commands?: string[];
  files?: FileOperation[];
  argCount: number;
}

export interface ScriptListItem {
  name: string;
  description?: string;
  args: Record<string, string> | undefined;
}

export interface CommandOptions {
  target: string;
}

export interface ExecutionContext {
  targetDir: string;
  args: string[];
  scriptName: string;
}