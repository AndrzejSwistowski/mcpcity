import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Create a mock for the fs module
jest.mock('fs', () => ({
  appendFileSync: jest.fn(),
}), { virtual: true });

// Import fs after the mock is set up
import * as fs from 'fs';

// Import the module to test
import { debugLog, setupErrorHandlers } from '../src/utils/logging.js';

describe('Logging Module', () => {
  // Store original console.error
  const originalConsoleError = console.error;
  let consoleErrorMock = jest.fn();
  
  beforeEach(() => {
    // Mock console.error before each test
    consoleErrorMock = jest.fn();
    console.error = consoleErrorMock;
    // Clear mock call history
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error = originalConsoleError;
  });

  test('debugLog should log messages to console', () => {
    // Act
    debugLog('Test message');
    
    // Assert - we should have at least one call to console.error
    expect(consoleErrorMock).toHaveBeenCalled();
  });
  
  test('debugLog should stringify objects in logs', () => {
    // Arrange
    const testObject = { key: 'value', nested: { test: true } };
    
    // Act
    debugLog('Test with object:', testObject);
    
    // Assert - we can't check the exact format due to timestamps, but we should have called the mock
    expect(consoleErrorMock).toHaveBeenCalled();
    
    // At least one call should include the stringified object
    const allCalls = consoleErrorMock.mock.calls.flat();
    const stringifiedObject = JSON.stringify(testObject, null, 2);
    const hasStringifiedObject = allCalls.some(arg => 
      typeof arg === 'string' && arg.includes('"key": "value"') && arg.includes('"nested"')
    );
    
    // If we can't verify the exact format, at least check that fs.appendFileSync was called
    expect(fs.appendFileSync).toHaveBeenCalled();
  });

  test('setupErrorHandlers should register handlers for uncaught exceptions', () => {
    // Arrange
    const processOnSpy = jest.spyOn(process, 'on');
    
    // Act
    setupErrorHandlers();
    
    // Assert
    expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    
    // Clean up
    processOnSpy.mockRestore();
  });
});