import { Logger, setupErrorHandlers } from './src/utils/logging.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createConfiguredServer } from './src/handlers/serverFactory.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { loadConfig, appConfig } from './src/config/config.js';

// Process command line arguments to see if a config file was specified
const args = process.argv.slice(2);
const configFileIndex = args.findIndex(arg => arg === '--config' || arg === '-c');
if (configFileIndex >= 0 && args.length > configFileIndex + 1) {
  // If config file was specified, reload the configuration
  const configFilePath = args[configFileIndex + 1];
  // This will update the appConfig singleton with the values from the specified file
  Object.assign(appConfig, loadConfig(configFilePath));
}

// If fetch doesn't exist in global scope, add it
if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof global.fetch;
}

// Create logger first
const logger = new Logger();

// Set up error handlers
setupErrorHandlers(logger);

// Log the current configuration
logger.log("Starting with configuration:", appConfig);

async function runServer(server: Server): Promise<void> {
	try {
		const transport = new StdioServerTransport();
		await server.connect(transport);
		logger.log("Server connected to transport");
		
	}
	catch (error) {
		console.error("Error starting server:", error);
		logger.log("Error starting server:", error);
		throw error;
	}
}

runServer(createConfiguredServer(logger)).catch((error) => {
	logger.log("Fatal error in main():", error);
	process.exit(1);
}).finally(() => {
	logger.log("Server has been started and is running.");
});

logger.log("Last line of the script executed. If you see this, the server is running.");