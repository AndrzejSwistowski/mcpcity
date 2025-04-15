import { describe, test, expect } from '@jest/globals';
import { createConfiguredServer } from '../src/handlers/serverFactory.js';
import { NAME, VERSION } from '../src/common/version.js';
import { MockLogger } from './utils/testUtils.js';

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