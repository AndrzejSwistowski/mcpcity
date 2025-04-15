import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import path from 'path';

// Create a mock for the fs module
const mockAppendFileSync = jest.fn();
jest.mock('fs', () => ({
  appendFileSync: mockAppendFileSync,
  // Add any other fs methods that might be used
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

// Import fs after the mock is set up
import * as fs from 'fs';

// Import the module to test - this must come before the SpyLogger definition
import { Logger, setupErrorHandlers } from '../src/utils/logging.js';
import { log } from 'console';

/**
 * A spy version of Logger for testing that prevents actual console output
 */
class SpyLogger extends Logger {
  private spyLogCalls: any[][] = [];
  
  constructor(enabled: boolean = false, logPath: string = 'test-log.txt') {
    super(enabled, logPath); // Create with specific debug setting and log path
  }
  
  /**
   * Override the logError method to capture log calls instead of writing to console
   */
  protected override logError(message: any, ...params: any[]): void {
    // Instead of calling console.error, store the log in our spy array
    this.spyLogCalls.push([message, ...params]);
  }
 
	public lastMessage: string = '';

	override writeToFile(message: string): void {
		// Instead of writing to file, we can call the original method if needed
		super.writeToFile(message);
		// But we can also capture the message here if needed for testing
		this.lastMessage = message;
	}
  /**
   * Get all recorded log calls
   */
  public getLogCalls(): any[][] {
    return this.spyLogCalls;
  }
  
  /**
   * Clear recorded log calls
   */
  public clearLogCalls(): void {
    this.spyLogCalls = [];
  }
}

/**
 * A mock version of Logger used to verify console.error calls
 */

describe('Logger Class', () => {
  let logger: SpyLogger;
  
  beforeEach(() => {
    // Create a new logger instance for each test that uses a mock function
    logger = new SpyLogger(true, 'test-log.txt'); // Enable logging for testing
    
    // Clear mock call history
    jest.clearAllMocks();
  });

  test('log method should log messages when debug is enabled', () => {
    // Act
    logger.log('Test message');
    
    // Assert - we should have at least one call to our mocked function
    expect(logger.getLogCalls()).toHaveLength(1);
    expect(logger.lastMessage).toContain('Test message');
  });
  
  test('log method should stringify objects in logs', () => {
    // Arrange
    const testObject = { key: 'value', nested: { test: true } };
    
    // Act
    logger.log('Test with object:', testObject);
    
    // Assert
    expect(logger.getLogCalls().length).toBe(1);
    expect(logger.lastMessage).toContain('"key": "value"');
    
  });
  
  test('setupErrorHandlers should register handlers for uncaught exceptions', () => {
    // Arrange
    const processOnSpy = jest.spyOn(process, 'on');
    
    // Act - now passing the logger instance as required
    setupErrorHandlers(logger);
    
    // Assert
    expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    
    // Clean up
    processOnSpy.mockRestore();
  });
});

describe('SpyLogger', () => {
  let spyLogger: SpyLogger;
  
  beforeEach(() => {
    spyLogger = new SpyLogger(true); // Enable logging for testing
    jest.clearAllMocks();
  });
  
  test('SpyLogger should capture log calls without writing to console', () => {
    // Act
    spyLogger.log('Test message');
    
    // Assert - we should have recorded the log call
    expect(spyLogger.getLogCalls().length).toBe(1);
    expect(spyLogger.getLogCalls()[0][0]).toContain('Test message');
    
    // File should still be written to
    expect(spyLogger.lastMessage).toContain('Test message');
  });
  
  test('SpyLogger should handle object logging', () => {
    // Arrange
    const testObject = { key: 'value' };
    
    // Act
    spyLogger.log('Object:', testObject);
    
    // Assert
    expect(spyLogger.getLogCalls().length).toBe(1);
    expect(spyLogger.getLogCalls()[0][0]).toContain('"key": "value"');
  });
});