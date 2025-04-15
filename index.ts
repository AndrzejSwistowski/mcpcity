import { Logger, setupErrorHandlers } from './src/utils/logging.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createConfiguredServer } from './src/handlers/serverFactory.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// If fetch doesn't exist in global scope, add it
if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof global.fetch;
}

// Create logger first
const logger = new Logger();

// Set up error handlers
setupErrorHandlers(logger);

// Create and configure the server, passing the logger as a parameter
createConfiguredServer(logger);

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