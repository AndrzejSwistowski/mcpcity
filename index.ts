import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VERSION, NAME } from "./src/common/version.js";
import { CallToolRequestSchema, ListToolsRequestSchema, InitializeRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as search from './src/operations/citySearchSchema.js';
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Set up process error handlers to catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Don't exit the process to keep it running for debugging
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Log the promise details to help with debugging
  console.error('Promise:', promise);
});

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

// Add handler for initialization request
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error("Handling initialize request");
  return {
    serverInfo: {
      name: NAME,
      version: VERSION,
    },
    capabilities: {
      tools: {},
    },
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("Handling list tools request");
  return {
    tools: [
      {
        name: "city_search",
        description: "Search for cities based on a query string",
        inputSchema: zodToJsonSchema(search.citySearchSchema)
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`Handling call tool request for ${request.params.name}`);
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "city_search": {
        const args = search.citySearchSchema.parse(request.params.arguments);
        const results = mockCitySearch(args.q, args.language || 'pl');
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(NAME + " running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});