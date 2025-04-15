import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { appConfig } from '../config/config.js';

/**
 * Logger class to handle debug logging with configurable outputs
 */
export class Logger {
  private debug: boolean;
  protected logFilePath: string;

  /**
   * Creates a new Logger instance
   * @param debug Optional override for debug flag. If not provided, uses the value from configuration.
   * @param logFilePath Optional override for log file path. If not provided, uses the value from configuration.
   */
  constructor(
    debug?: boolean,
    logFilePath?: string
  ) {
    this.debug = debug !== undefined ? debug : appConfig.debug;
    this.logFilePath = logFilePath || appConfig.debugLogPath;
    
    // Ensure the directory for the log file exists
    this.ensureLogDirectoryExists();
  }

  /**
   * Ensures that the directory for the log file exists
   */
  private ensureLogDirectoryExists(): void {
    try {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create log directory:", error);
    }
  }

  /**
   * Logs debug messages to file and console
   * @param args Arguments to log
   */
  public log(...args: any[]): void {
    if (!this.debug) return;

    try {
      const timestamp = new Date().toISOString();
      const message = `[${timestamp}] ${args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`;

      // Also log to file
      this.writeToFile(message);
      this.logError(message); // Log to stderr for immediate visibility in console
    } catch (error) {
      this.logError("Error writing to debug log file:", error);
    }
  }
	
  protected writeToFile(message: string) {
    fs.appendFileSync(this.logFilePath, message + '\n');
  }

  protected logError(message: any, ...params: any[]): void {
    console.error(message, ...params);
  }

  /**
   * Gets the current log file path
   */
  public getLogFilePath(): string {
    return this.logFilePath;
  }
  
  /**
   * Checks if debugging is enabled
   */
  public isDebugEnabled(): boolean {
    return this.debug;
  }
  
  /**
   * Enables or disables debugging
   * @param enable Whether to enable debugging
   */
  public setDebugEnabled(enable: boolean): void {
    this.debug = enable;
  }
  
  /**
   * Sets a new log file path
   * @param logFilePath The new log file path
   */
  public setLogFilePath(logFilePath: string): void {
    this.logFilePath = logFilePath;
    this.ensureLogDirectoryExists();
  }
}

// Set up process error handlers to catch uncaught exceptions
export function setupErrorHandlers(logger: Logger): void {
  process.on('uncaughtException', (err) => {
    // Don't exit the process to keep it running for debugging
    logger.log('UNCAUGHT EXCEPTION:', err, err.stack);
  });

  process.on('unhandledRejection', (reason, promise) => {
    // Log the promise details to help with debugging
    logger.log('UNHANDLED REJECTION:', reason, 'Promise:', promise);
  });
}