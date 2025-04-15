import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VERSION, NAME } from "../common/version.js";
import { Logger } from "../utils/logging.js";
import { CitySearchHttpClient } from "../services/citysearchHttpClient.js";
import { setupRequestHandlers } from "./requestHandlers.js";

/**
 * Creates and configures a server instance with all necessary components
 * @param logger The logger instance to use for logging
 * @returns A configured server ready to connect to a transport
 */
export function createConfiguredServer(logger: Logger): Server {
  // Initialize the city search client
  const citySearchClient = new CitySearchHttpClient();
  
  // Create a new server instance
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
  
  // Configure the server with request handlers
  setupRequestHandlers(server, logger, citySearchClient);
  
  return server;
}