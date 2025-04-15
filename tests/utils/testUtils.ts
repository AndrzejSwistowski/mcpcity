import { jest } from '@jest/globals';
import { Logger } from '../../src/utils/logging.js';

/**
 * A mock Logger implementation for testing
 */
export class MockLogger extends Logger {
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

/**
 * A spy logger implementation that uses Jest spies for testing
 */
export class SpyLogger extends Logger {
  // Fix TypeScript errors by using the correct type for Jest spies
  public logSpy: jest.Mock;
  public writeToFileSpy: jest.Mock;
  public logErrorSpy: jest.Mock;
  
  constructor() {
    super(false); // Disable actual debug output
    
    // Create mock functions instead of spies
    this.logSpy = jest.fn();
    this.writeToFileSpy = jest.fn();
    this.logErrorSpy = jest.fn();
    
    // Override the original methods with our mocks
    this.log = this.logSpy;
    
    // Use TypeScript type assertions to assign the mocks
    this.writeToFile = this.writeToFileSpy as unknown as typeof this.writeToFile;
    this.logError = this.logErrorSpy as unknown as typeof this.logError;
  }
  
  // Helper method to check if a specific message was logged
  public wasLoggedWith(text: string): boolean {
    return this.logSpy.mock.calls.some((call: any[]) => 
      call.some((arg: any) => typeof arg === 'string' && arg.includes(text))
    );
  }
  
  // Helper method to reset all spies
  public resetSpies(): void {
    this.logSpy.mockClear();
    this.writeToFileSpy.mockClear();
    this.logErrorSpy.mockClear();
  }
}