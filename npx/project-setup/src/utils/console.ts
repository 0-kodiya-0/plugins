import chalk from 'chalk';
import logSymbols from 'log-symbols';
import ora, { Ora } from 'ora';

export class ConsoleUtils {
  static success(message: string): void {
    console.log(`${logSymbols.success} ${chalk.green(message)}`);
  }

  static error(message: string): void {
    console.error(`${logSymbols.error} ${chalk.red(message)}`);
  }

  static warning(message: string): void {
    console.warn(`${logSymbols.warning} ${chalk.yellow(message)}`);
  }

  static info(message: string): void {
    console.log(`${logSymbols.info} ${chalk.blue(message)}`);
  }

  static title(message: string): void {
    console.log(`\n${chalk.bold.cyan(message)}`);
  }

  static subtitle(message: string): void {
    console.log(`\n${chalk.bold(message)}`);
  }

  static dim(message: string): void {
    console.log(chalk.dim(message));
  }

  static highlight(message: string): void {
    console.log(chalk.bold.magenta(message));
  }

  static command(command: string): void {
    console.log(`${chalk.dim('$')} ${chalk.cyan(command)}`);
  }

  static progress(current: number, total: number, message: string): void {
    const progressBar = this.createProgressBar(current, total);
    console.log(`  ${progressBar} ${current}/${total} ${message}`);
  }

  static listItem(item: string, description?: string): void {
    console.log(`  ${chalk.cyan('•')} ${chalk.bold(item)}`);
    if (description) {
      console.log(`    ${chalk.dim(description)}`);
    }
  }

  static argument(argName: string, value: string, status: 'success' | 'error' = 'success'): void {
    const icon = status === 'success' ? logSymbols.success : logSymbols.error;
    const color = status === 'success' ? chalk.green : chalk.red;
    console.log(`  ${icon} ${chalk.bold(argName)}: ${color(value)}`);
  }

  static separator(): void {
    console.log();
  }

  static createSpinner(text: string): Ora {
    return ora({
      text,
      color: 'cyan',
      spinner: 'dots'
    });
  }

  private static createProgressBar(current: number, total: number, width: number = 20): string {
    const percentage = current / total;
    const filled = Math.round(width * percentage);
    const empty = width - filled;
    
    const filledBar = chalk.cyan('█'.repeat(filled));
    const emptyBar = chalk.dim('░'.repeat(empty));
    
    return `[${filledBar}${emptyBar}]`;
  }

  static fileOperation(source: string, destination: string, type: 'file' | 'directory' = 'file'): void {
    const icon = type === 'file' ? '📄' : '📁';
    console.log(`  ${icon} ${chalk.dim(source)} ${chalk.yellow('→')} ${chalk.green(destination)}`);
  }

  static usage(command: string): void {
    console.log(`\n${chalk.bold('Usage:')} ${chalk.cyan(command)}\n`);
  }
}