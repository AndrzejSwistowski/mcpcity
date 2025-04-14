import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Schema for city search operation
 * Defines the input parameters for searching cities
 */
export const citySearchSchema = z.object({
  /**
   * Query string to search for cities
   */
  q: z.string().describe('query'),
  
  /**
   * Language code for the search results
   * Default: 'pl' (Polish)
   */
  language: z.string().default('pl').optional(),
});

/**
 * Type definition for the city search parameters
 */
export type CitySearchParams = z.infer<typeof citySearchSchema>;

/**
 * JSON Schema representation of the city search schema
 */
export const citySearchJsonSchema = zodToJsonSchema(citySearchSchema, {
  name: 'CitySearch',
});

export default citySearchSchema;