/**
 * Configuration module for the MCP City application
 * Handles loading configuration from files and environment variables
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Application configuration interface
 */
export interface AppConfig {
  /** Base URL for the city search API */
  citySearchBaseUrl: string;
  /** Default language for city search */
  defaultLanguage: string;
  /** Debug mode flag */
  debug: boolean;
  /** Path to the debug log file */
  debugLogPath: string;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: AppConfig = {
  citySearchBaseUrl: 'https://citiessubstitute.t.voyager.pl/CitiesSearch',
  defaultLanguage: 'pl',
  debug: false,
  debugLogPath: path.join(os.tmpdir(), 'mcp-city-debug.log')
};

/**
 * Loads configuration from a JSON file
 * @param filePath Path to the configuration file
 * @returns Configuration object from the file, or empty object if file doesn't exist or has invalid JSON
 */
function loadConfigFromFile(filePath: string): Partial<AppConfig> {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error(`Error loading config from ${filePath}:`, error);
  }
  
  return {};
}

/**
 * Loads configuration from environment variables
 * Environment variables take precedence over file configuration
 * @returns Configuration object from environment variables
 */
function loadConfigFromEnv(): Partial<AppConfig> {
  const config: Partial<AppConfig> = {};
  
  if (process.env.CITY_SEARCH_BASE_URL) {
    config.citySearchBaseUrl = process.env.CITY_SEARCH_BASE_URL;
  }
  
  if (process.env.DEFAULT_LANGUAGE) {
    config.defaultLanguage = process.env.DEFAULT_LANGUAGE;
  }
  
  // Add environment variables for debug options
  if (process.env.DEBUG !== undefined) {
    config.debug = process.env.DEBUG === 'true' || process.env.DEBUG === '1';
  }
  
  if (process.env.DEBUG_LOG_PATH) {
    config.debugLogPath = process.env.DEBUG_LOG_PATH;
  }
  
  return config;
}

/**
 * Loads and merges configuration from all sources
 * Priority order: environment variables > config file > defaults
 * @param configFilePath Optional path to the configuration file
 * @returns Merged configuration object
 */
export function loadConfig(configFilePath?: string): AppConfig {
  // Start with default configuration
  let config: AppConfig = { ...DEFAULT_CONFIG };
  
  // If config file path is provided, load and merge file configuration
  if (configFilePath) {
    config = { ...config, ...loadConfigFromFile(configFilePath) };
  } else {
    // Try to load from default locations
    const defaultPaths = [
      path.join(process.cwd(), 'config.json'),
      path.join(process.cwd(), 'mcpcity.config.json')
    ];
    
    for (const filePath of defaultPaths) {
      const fileConfig = loadConfigFromFile(filePath);
      if (Object.keys(fileConfig).length > 0) {
        config = { ...config, ...fileConfig };
        break;
      }
    }
  }
  
  // Finally, apply environment variables (highest priority)
  config = { ...config, ...loadConfigFromEnv() };
  
  return config;
}

// Export a singleton instance of the configuration
export const appConfig = loadConfig();