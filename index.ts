import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VERSION, NAME } from "./src/common/version.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as search from './src/operations/citySearchSchema.js';


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
				name: "citySearch",
				description: "Search for cities based on a query string",
				inputSchema: search.citySearchJsonSchema,
			}]
	}
}
);

// Hello World program in TypeScript

function sayHello(name: string = "World"): string {
    return `Hello, ${name}!`;
}

// Print hello message to console
console.log(sayHello());

// Export the function for potential use in other modules
export { sayHello };