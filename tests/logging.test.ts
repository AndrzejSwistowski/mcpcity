import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import path from 'path';

// Create mock functions that we can assert against
const mockAppendFileSync = jest.fn();

// Import the module to test
import { Logger, setupErrorHandlers } from '../src/utils/logging.js';
import { MockLogger } from './utils/testUtils.js';

// Create a spy for console.error to prevent actual console output in tests
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Create a test-specific logger class that uses our mock function
class TestLogger extends Logger {
  protected override writeToFile(message: string): void {
    // Instead of calling the real fs.appendFileSync, call our mock
    mockAppendFileSync(this.logFilePath, message);
  }
}

describe('Logger Class', () => {
  let logger: TestLogger;
  
  beforeEach(() => {
    // Create a new logger instance for each test
    logger = new TestLogger(true, 'test-log.txt'); // Enable logging for testing
    
    // Clear mock call history
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Clean up
    consoleErrorSpy.mockClear();
  });

  test('log method should log messages when debug is enabled', () => {
    // Act
    logger.log('Test message');
    
    // Assert - we should have a call to our mocked appendFileSync
    expect(mockAppendFileSync).toHaveBeenCalled();
    expect(mockAppendFileSync).toHaveBeenCalledWith(
      'test-log.txt',
      expect.stringContaining('Test message')
    );
  });
  
  test('log method should stringify objects in logs', () => {
    // Arrange
    const testObject = { key: 'value', nested: { test: true } };
    
    // Act
    logger.log('Test with object:', testObject);
    
    // Assert
    expect(mockAppendFileSync).toHaveBeenCalled();
    expect(mockAppendFileSync).toHaveBeenCalledWith(
      'test-log.txt',
      expect.stringContaining('"key"')
    );
  });
  
  test('setupErrorHandlers should register handlers for uncaught exceptions', () => {
    // Arrange
    const processOnSpy = jest.spyOn(process, 'on');
    
    // Act
    setupErrorHandlers(logger);
    
    // Assert
    expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    
    // Clean up
    processOnSpy.mockRestore();
  });
});

describe('MockLogger', () => {
  let mockLogger: MockLogger;
  
  beforeEach(() => {
    mockLogger = new MockLogger();
    jest.clearAllMocks();
  });
  
  test('MockLogger should capture log calls without writing to console or file', () => {
    // Act
    mockLogger.log('Test message');
    
    // Assert - message should be captured in the messages array
    expect(mockLogger.messages.length).toBe(1);
    expect(mockLogger.messages[0]).toContain('Test message');
    
    // No file should be written
    expect(mockAppendFileSync).not.toHaveBeenCalled();
  });
  
  test('MockLogger should handle object logging', () => {
    // Arrange
    const testObject = { key: 'value' };
    
    // Act
    mockLogger.log('Object:', testObject);
    
    // Assert
    expect(mockLogger.messages.length).toBe(1);
    expect(mockLogger.messages[0]).toContain('"key":"value"');
  });
  
  test('hasLogContaining should correctly identify matching log messages', () => {
    // Act
    mockLogger.log('First message');
    mockLogger.log('Second message with special content');
    
    // Assert
    expect(mockLogger.hasLogContaining('special content')).toBe(true);
    expect(mockLogger.hasLogContaining('not present')).toBe(false);
  });
});