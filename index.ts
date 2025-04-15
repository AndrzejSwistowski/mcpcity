import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VERSION, NAME } from "./src/common/version.js";
import { CallToolRequestSchema,  ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as search from './src/operations/citySearchSchema.js';
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {  Logger, setupErrorHandlers } from './src/utils/logging.js';
import { CitySearchHttpClient } from './src/services/citysearchHttpClient.js';

// If fetch doesn't exist in global scope, add it
if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof global.fetch;
}

const logger = new Logger();
// Set up error handlers
setupErrorHandlers(logger);

// Initialize the city search client
const citySearchClient = new CitySearchHttpClient();

const server = new Server(
  {
    name: NAME,
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

logger.log('Server instance created with name:', NAME, 'version:', VERSION);


server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.log("Handling list tools request");
  return {
    tools: [
      {
        name: "city_search",
        description: "Search for cities based on a query string",
        inputSchema: search.citySearchJsonSchema
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.log(`Handling call tool request for ${request.params.name}`);
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "city_search": {
        const args = search.citySearchSchema.parse(request.params.arguments);
        
        const results = await citySearchClient.search(args.q, args.language || 'pl');
        
        logger.log('City search results:', results);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.log('Invalid input error:', error.errors);
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    logger.log('Error in call tool request handler:', error);
    throw error;
  }
});

async function runServer() {
	try {
		logger.log("Starting server...");
		const transport = new StdioServerTransport();
		logger.log("Transport created:");
		await server.connect(transport);
		logger.log("Server connected to transport");
		
	}
	catch (error) {
		console.error("Error starting server:", error);
		logger.log("Error starting server:", error);
		throw error;
	}
}

runServer().catch((error) => {
	logger.log("Fatal error in main():", error);
	process.exit(1);
}).finally(() => {
	logger.log("Server has been started and is running.");
});

logger.log("Last line of the script executed. If you see this, the server is running.");