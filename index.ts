import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VERSION, NAME } from "./src/common/version.js";
import { CallToolRequestSchema,  ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as search from './src/operations/citySearchSchema.js';
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { debugLog, setupErrorHandlers } from './src/utils/logging.js';

// If fetch doesn't exist in global scope, add it
if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof global.fetch;
}

// Set up error handlers
setupErrorHandlers();

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

debugLog('Server instance created with name:', NAME, 'version:', VERSION);


server.setRequestHandler(ListToolsRequestSchema, async () => {
  debugLog("Handling list tools request");
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
  debugLog(`Handling call tool request for ${request.params.name}`);
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "city_search": {
        const args = search.citySearchSchema.parse(request.params.arguments);
        const results = mockCitySearch(args.q, args.language || 'pl');
        debugLog('City search results:', results);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      debugLog('Invalid input error:', error.errors);
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    debugLog('Error in call tool request handler:', error);
    throw error;
  }
});

// Mock function to simulate city search
function mockCitySearch(query: string, language: string) {
  // Expanded mock data including smaller towns and cities
  const mockCities = [
    { name: 'Warsaw', country: 'Poland', population: 1793000 },
    { name: 'Krakow', country: 'Poland', population: 780000 },
    { name: 'Łódź', country: 'Poland', population: 672000 },
    { name: 'Wrocław', country: 'Poland', population: 641000 },
    { name: 'Poznań', country: 'Poland', population: 534000 },
    { name: 'Gdańsk', country: 'Poland', population: 470000 },
    { name: 'Szczecin', country: 'Poland', population: 401000 },
    { name: 'Bydgoszcz', country: 'Poland', population: 348000 },
    { name: 'Lublin', country: 'Poland', population: 339000 },
    { name: 'Białystok', country: 'Poland', population: 297000 },
    { name: 'Katowice', country: 'Poland', population: 294000 },
    { name: 'Kaniów', country: 'Poland', population: 3200 },
    { name: 'Czechowice-Dziedzice', country: 'Poland', population: 35000 },
    { name: 'Bestwina', country: 'Poland', population: 1100 },
    { name: 'Bielsko-Biała', country: 'Poland', population: 169000 }
  ];
  
  // Normalize input for better matching (remove diacritics, case-insensitive)
  const normalizeText = (text: string): string => {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  };
  
  const normalizedQuery = normalizeText(query);
  
  // More flexible search that handles diacritics and partial matches
  return mockCities.filter(city => {
    const normalizedCityName = normalizeText(city.name);
    return normalizedCityName.includes(normalizedQuery) || 
           normalizedQuery.includes(normalizedCityName);
  });
}

async function runServer() {
	try {
		debugLog("Starting server...");
		const transport = new StdioServerTransport();
		debugLog("Transport created:");
		await server.connect(transport);
		debugLog("Server connected to transport");
		
	}
	catch (error) {
		console.error("Error starting server:", error);
		debugLog("Error starting server:", error);
		throw error;
	}
}

runServer().catch((error) => {
	debugLog("Fatal error in main():", error);
	process.exit(1);
}).finally(() => {
	debugLog("Server has been started and is running.");
});

// Sleep for a second before proceeding
await new Promise(resolve => setTimeout(resolve, 1000));
debugLog("Last line of the script executed. If you see this, the server is running.");