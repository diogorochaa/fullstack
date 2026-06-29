import chalk from "chalk";

type LogScope = "API" | "EMAIL" | "STOCK" | "ANALYTICS" | "KAFKA" | "PLAYGROUND";
type Colorizer = (message: string) => string;

const colors: Record<LogScope, Colorizer> = {
  API: chalk.cyan,
  EMAIL: chalk.magenta,
  STOCK: chalk.green,
  ANALYTICS: chalk.yellow,
  KAFKA: chalk.blue,
  PLAYGROUND: chalk.white
};

export class Logger {
  constructor(private readonly scope: LogScope) {}

  info(message: string, details?: Record<string, string | number | boolean | null>): void {
    this.write(chalk.white(message), details);
  }

  success(message: string, details?: Record<string, string | number | boolean | null>): void {
    this.write(chalk.green(message), details);
  }

  warn(message: string, details?: Record<string, string | number | boolean | null>): void {
    this.write(chalk.yellow(message), details);
  }

  error(message: string, error?: unknown): void {
    const text = error instanceof Error ? error.message : String(error ?? "");
    this.write(chalk.red(message), text ? { error: text } : undefined);
  }

  private write(message: string, details?: Record<string, string | number | boolean | null>): void {
    const prefix = colors[this.scope](`[${this.scope}]`);
    console.log(`${prefix} ${message}`);

    if (details) {
      Object.entries(details).forEach(([key, value]) => {
        console.log(`${prefix} ${chalk.dim(`${key}:`)} ${value ?? "-"}`);
      });
    }
  }
}
