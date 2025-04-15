import { describe, test, expect } from '@jest/globals';
import { setupRequestHandlers } from '../src/handlers/requestHandlers.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CitySearchHttpClient } from '../src/services/citysearchHttpClient.js';
import { MockLogger } from './utils/testUtils.js';

// Create a mock server that counts handler registrations
class MockServer {
  private handlerCount = 0;
  
  setRequestHandler(schema: any, handler: Function): void {
    console.log(`Registering handler for schema: ${JSON.stringify(schema)}`);
    this.handlerCount++;
  }
  
  getHandlersCount(): number {
    return this.handlerCount;
  }
}

describe('requestHandlers', () => {
  test('setupRequestHandlers should register request handlers', () => {
    // Arrange
    const mockLogger = new MockLogger();
    const mockServer = new MockServer() as unknown as Server;
    const mockClient = new CitySearchHttpClient();
    
    // Act
    setupRequestHandlers(mockServer, mockLogger, mockClient);
    
    // Assert
    // Verify that handlers were registered (basic check)
    expect((mockServer as unknown as MockServer).getHandlersCount()).toBe(2);
  });
});