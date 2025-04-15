import { describe, test, expect } from '@jest/globals';
import { setupRequestHandlers } from '../src/handlers/requestHandlers.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Logger } from '../src/utils/logging.js';
import { CitySearchHttpClient } from '../src/services/citysearchHttpClient.js';

// Create a simple MockLogger that extends the real Logger
class MockLogger extends Logger {
  public messages: string[] = [];
  
  constructor() {
    super(false); // Disable actual debug output
  }
  
  override log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    this.messages.push(message);
  }
  
  protected override writeToFile(): void {
    // Override to prevent actual file writing
  }
  
  protected override logError(): void {
    // Override to prevent console output
  }
  
  // Helper method to check if a log message exists
  public hasLogContaining(text: string): boolean {
    return this.messages.some(msg => msg.includes(text));
  }
}

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