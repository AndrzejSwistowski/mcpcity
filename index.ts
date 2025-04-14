import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VERSION, NAME } from "./src/common/version.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as search from './src/operations/citySearchSchema.js';
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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
				const mockResult = args; 
				return {
					content: [{ type: "text", text: JSON.stringify(mockResult) }],
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

// Hello World program in TypeScript

function sayHello(name: string = "World"): string {
    return `Hello, ${name}!`;
}

// Print hello message to console
console.log(sayHello());

// Export the function for potential use in other modules
export { sayHello };


async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(VERSION + " running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});