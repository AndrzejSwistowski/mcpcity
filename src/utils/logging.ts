import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Debug configuration
export const DEBUG = true;
export const DEBUG_LOG_FILE = path.join(os.tmpdir(), 'mcp-city-debug.log');

// Debug logging function
export function debugLog(...args: any[]) {
	if (DEBUG) {
		try {
			console.error(DEBUG_LOG_FILE); // Log to stderr for immediate visibility in console
			const timestamp = new Date().toISOString();
			const message = `[${timestamp}] ${args.map(arg =>
				typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
			).join(' ')}`;
    
			// Also log to file
			fs.appendFileSync(DEBUG_LOG_FILE, message + '\n');
			console.error(message); // Log to stderr for immediate visibility in console
		}
		catch (error) {
			console.error("Error writing to debug log file:", error);
		}
    }
}

// Set up process error handlers to catch uncaught exceptions
export function setupErrorHandlers() {
    process.on('uncaughtException', (err) => {
        // Don't exit the process to keep it running for debugging
        debugLog('UNCAUGHT EXCEPTION:', err, err.stack);
    });

    process.on('unhandledRejection', (reason, promise) => {
        // Log the promise details to help with debugging
        debugLog('UNHANDLED REJECTION:', reason, 'Promise:', promise);
    });
}

// Log that debugging is enabled
debugLog(`Debugging enabled. Log file: ${DEBUG_LOG_FILE}`);