/**
 * SecureStore Mocks for Testing
 * Mock implementations for expo-secure-store operations
 */

const secureStoreMock = {
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
};

export const setupSecureStoreMocks = (options?: {
  apiKey?: string | null;
  aiEnabled?: boolean;
  shouldFail?: boolean;
}) => {
  const { apiKey = null, aiEnabled = false, shouldFail = false } = options || {};

  secureStoreMock.getItemAsync.mockImplementation((key: string) => {
    if (shouldFail) {
      return Promise.reject(new Error('SecureStore error'));
    }
    if (key === 'gemini_api_key') {
      return Promise.resolve(apiKey);
    }
    if (key === 'ai_enabled_status') {
      return Promise.resolve(aiEnabled ? 'true' : 'false');
    }
    return Promise.resolve(null);
  });

  secureStoreMock.setItemAsync.mockImplementation((key: string, value: string) => {
    if (shouldFail) {
      return Promise.reject(new Error('SecureStore error'));
    }
    return Promise.resolve(undefined);
  });

  secureStoreMock.deleteItemAsync.mockImplementation((key: string) => {
    if (shouldFail) {
      return Promise.reject(new Error('SecureStore error'));
    }
    return Promise.resolve(undefined);
  });
};

export const getSecureStoreMock = () => secureStoreMock;

export const clearSecureStoreMocks = () => {
  secureStoreMock.setItemAsync.mockClear();
  secureStoreMock.getItemAsync.mockClear();
  secureStoreMock.deleteItemAsync.mockClear();
};

export default secureStoreMock;
