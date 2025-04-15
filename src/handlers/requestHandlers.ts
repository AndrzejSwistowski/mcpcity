import { Logger } from '../utils/logging.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as search from '../operations/citySearchSchema.js';
import { z } from "zod";
import { CitySearchHttpClient } from '../services/citysearchHttpClient.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

/**
 * Sets up the request handlers for the MCP server
 * @param server The server instance to configure
 * @param logger The logger instance for logging
 * @param citySearchClient The city search client instance
 */
export function setupRequestHandlers(
  server: Server,
  logger: Logger,
  citySearchClient: CitySearchHttpClient
): void {
  // Set up list tools request handler
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

  // Set up call tool request handler
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
}