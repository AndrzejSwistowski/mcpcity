import { describe, test, expect } from '@jest/globals';
import { createConfiguredServer } from '../src/handlers/serverFactory.js';
import { Logger } from '../src/utils/logging.js';
import { NAME, VERSION } from '../src/common/version.js';

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

describe('serverFactory', () => {
  test('createConfiguredServer should create a properly configured server', () => {
    // Arrange
    const mockLogger = new MockLogger();
    
    // Act
    const server = createConfiguredServer(mockLogger);
    
    // Assert
    // Check that the server was created (we can only do basic checks here)
    expect(server).toBeDefined();
    
    // Check that logger received the expected messages
    expect(mockLogger.hasLogContaining(`Server instance created with name: ${NAME} version: ${VERSION}`)).toBe(true);
  });
});