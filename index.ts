import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VERSION, NAME } from "./src/common/version.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as search from './src/operations/citySearchSchema.js';
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// If fetch doesn't exist in global scope, add it
if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof global.fetch;
}

console.log("Starting server...");


const server = new Server(
	{
		name: NAME,
		version: VERSION,
	},
	{
		capabilities: {
			tools: {},
		},
	});

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {	
		tools: [
			{
				name: "city_search",
				description: "Search for cities based on a query string",
				inputSchema: zodToJsonSchema(search.citySearchSchema)
			}]
	}
}
);

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	try {
		if (!request.params.arguments) {
			throw new Error("Arguments are required");
		}

		switch (request.params.name) {
			case "city_search": {
				const args = search.citySearchSchema.parse(request.params.arguments);
				const results = mockCitySearch(args.q, args.language || 'pl');
				return {
					content: [{ type: "text", text: JSON.stringify({ query: args.q, language: args.language, results }) }],
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
  // Simple mock data for demonstration
  const mockCities = [
    { name: 'Warsaw', country: 'Poland', population: 1793000 },
    { name: 'Krakow', country: 'Poland', population: 780000 },
    { name: 'Łódź', country: 'Poland', population: 672000 },
    { name: 'Wrocław', country: 'Poland', population: 641000 },
    { name: 'Poznań', country: 'Poland', population: 534000 }
  ];
  
  // Filter cities based on the query (case-insensitive)
  return mockCities.filter(city => 
    city.name.toLowerCase().includes(query.toLowerCase())
  );
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