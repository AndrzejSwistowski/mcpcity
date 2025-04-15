import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Logger class to handle debug logging with configurable outputs
 */
export class Logger {
  private debug: boolean;
  protected logFilePath: string;

  /**
   * Creates a new Logger instance
   * @param debug Whether debug logging is enabled
   * @param logFilePath Path to the log file
   */
  constructor(
    debug: boolean = true,
    logFilePath: string = path.join(os.tmpdir(), 'mcp-city-debug.log')
  ) {
    this.debug = debug;
    this.logFilePath = logFilePath;
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

}

// Create the default logger instance
//const defaultLogger = new Logger();

// Export the default methods for backward compatibility
//export const debugLog = (...args: any[]): void => defaultLogger.log(...args);
//export const consoleError = (message?: any, ...optionalParams: any[]): void => 
//  console.error(message, ...optionalParams);

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

// Log that debugging is enabled
//debugLog(`Debugging enabled. Log file: ${defaultLogger.getLogFilePath()}`);