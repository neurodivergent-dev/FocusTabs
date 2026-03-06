/**
 * Google AI SDK Mocks for Testing
 * Mock implementations for @google/generative-ai
 */

export const mockAIResponse = {
  response: {
    text: jest.fn().mockReturnValue('Mocked AI response'),
  },
};

export const mockChatResponse = {
  response: {
    text: jest.fn().mockReturnValue('Mocked chat response'),
  },
};

export const createMockModel = (options?: {
  response?: string;
  shouldFail?: boolean;
  delay?: number;
}) => {
  const { response = 'Mocked AI response', shouldFail = false, delay = 0 } = options || {};

  return {
    generateContent: jest.fn().mockImplementation(async () => {
      if (shouldFail) {
        throw new Error('AI API error');
      }
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return {
        response: {
          text: jest.fn().mockReturnValue(response),
        },
      };
    }),
    startChat: jest.fn().mockReturnValue({
      sendMessage: jest.fn().mockImplementation(async () => {
        if (shouldFail) {
          throw new Error('AI Chat error');
        }
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        return {
          response: {
            text: jest.fn().mockReturnValue(response),
          },
        };
      }),
    }),
  };
};

export const createMockGenerativeAI = (options?: {
  response?: string;
  shouldFail?: boolean;
}) => {
  const { response = 'Mocked AI response', shouldFail = false } = options || {};

  return {
    getGenerativeModel: jest.fn().mockReturnValue(createMockModel({ response, shouldFail })),
  };
};

export const setupAIMocks = (options?: {
  response?: string;
  shouldFail?: boolean;
  quotaExceeded?: boolean;
}) => {
  const { response = 'Mocked AI response', shouldFail = false, quotaExceeded = false } = options || {};

  jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      if (quotaExceeded) {
        return {
          getGenerativeModel: jest.fn().mockImplementation(() => ({
            generateContent: jest.fn().mockRejectedValue({
              message: '429 Too Many Requests',
            }),
          })),
        };
      }

      if (shouldFail) {
        return {
          getGenerativeModel: jest.fn().mockImplementation(() => ({
            generateContent: jest.fn().mockRejectedValue(new Error('AI API error')),
          })),
        };
      }

      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue(response),
            },
          }),
          startChat: jest.fn().mockReturnValue({
            sendMessage: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn().mockReturnValue(response),
              },
            }),
          }),
        }),
      };
    }),
  }));
};

export const clearAIMocks = () => {
  jest.clearAllMocks();
};

export default {
  mockAIResponse,
  mockChatResponse,
  createMockModel,
  createMockGenerativeAI,
  setupAIMocks,
  clearAIMocks,
};
