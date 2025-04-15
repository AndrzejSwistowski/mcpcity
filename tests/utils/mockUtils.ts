import { jest } from '@jest/globals';

/**
 * A utility for mocking Node.js built-in modules in ESM environments
 */
export function createMockModule(moduleName: string, mockImplementation: Record<string, any>): void {
  // Apply the mock implementation
  jest.mock(moduleName, () => mockImplementation, { virtual: true });
}

/**
 * Mock FS module for testing
 */
export const mockFs = {
  appendFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
};

// Pre-configure common module mocks
createMockModule('fs', mockFs);