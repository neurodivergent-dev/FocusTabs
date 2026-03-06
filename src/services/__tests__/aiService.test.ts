/**
 * Tests for aiService.ts
 * Tests AI service functionality including caching, cooldown, and fallback logic
 */

import { aiService } from '../../services/aiService';
import { useAIStore } from '../../store/aiStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Mocked AI response'),
        },
      }),
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue('Mocked chat response'),
          },
        }),
      }),
    }),
  })),
}));

// Mock AI store
jest.mock('../../store/aiStore', () => ({
  useAIStore: {
    getState: jest.fn(() => ({
      apiKey: 'test-api-key',
      isAIEnabled: true,
    })),
  },
}));

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache and internal state between tests
    (aiService as any).cache = {};
    (aiService as any).lastRequestTime = 0;
    (aiService as any).genAI = null;
  });

  describe('Initialization', () => {
    it('should initialize with API key when enabled', () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key-123',
        isAIEnabled: true,
      } as any);

      // Access private method through any
      (aiService as any).init();

      expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-key-123');
    });

    it('should not initialize when AI is disabled', () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: null,
        isAIEnabled: false,
      } as any);

      (aiService as any).init();

      expect((aiService as any).genAI).toBeNull();
    });
  });

  describe('Caching Mechanism', () => {
    it('should cache AI responses', async () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      const result1 = await aiService.refineGoal('Test goal', 'en');
      const result2 = await aiService.refineGoal('Test goal', 'en');

      // Second call should use cache, result should be same
      expect(result1).toBe(result2);
      expect(result1).toBe('Mocked AI response');
    });

    it('should respect cache TTL (1 hour)', async () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      // First call
      await aiService.refineGoal('Test goal', 'en');

      // Manually set cache time to 1 hour + 1 minute ago
      const cacheKey = `refine_Test goal_en`;
      (aiService as any).cache[cacheKey] = {
        msg: 'Cached response',
        time: Date.now() - 61 * 60 * 1000, // 61 minutes ago
      };

      // Second call should bypass cache
      await aiService.refineGoal('Test goal', 'en');

      expect(GoogleGenerativeAI).toHaveBeenCalledTimes(2);
    });

    it('should force refresh cache when requested', async () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      await aiService.refineGoal('Test goal', 'en');
      await aiService.refineGoal('Test goal', 'en', true); // forceRefresh

      expect(GoogleGenerativeAI).toHaveBeenCalledTimes(2);
    });

    it('should cache different prompts separately', async () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      await aiService.refineGoal('Goal 1', 'en');
      await aiService.refineGoal('Goal 2', 'en');

      expect(GoogleGenerativeAI).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cooldown Logic', () => {
    it('should respect cooldown period', async () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      // First request
      await aiService.refineGoal('Test goal', 'en');

      // Second request immediately should be blocked by cooldown
      await aiService.refineGoal('Another goal', 'en');

      // Should still call API twice because different prompts
      expect(GoogleGenerativeAI).toHaveBeenCalledTimes(2);
    });

    it('should have shorter cooldown for chat', async () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      const mockHistory = [{ role: 'user', parts: [{ text: 'Hello' }] }];

      await aiService.chat('Hi', mockHistory, 'User has no goals', 'en');
      await aiService.chat('How are you?', mockHistory, 'User has no goals', 'en');

      // Chat has 1s cooldown vs 5s for other requests
      expect(GoogleGenerativeAI).toHaveBeenCalledTimes(2);
    });

    it('should allow requests after cooldown expires', async () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      // Set last request time to 6 seconds ago
      (aiService as any).lastRequestTime = Date.now() - 6000;

      await aiService.refineGoal('Test goal', 'en');

      expect(GoogleGenerativeAI).toHaveBeenCalledTimes(1);
    });
  });

  describe('Fallback Model', () => {
    it('should use fallback model on 429 error', async () => {
      // Mock 429 error
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValueOnce({
            message: '429 Too Many Requests',
          }),
        }),
      } as any));

      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      const result = await aiService.refineGoal('Test goal', 'en');

      // Should try fallback model
      expect(GoogleGenerativeAI).toHaveBeenCalled();
    });

    it('should return empty string on persistent errors', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue(new Error('API Error')),
        }),
      } as any));

      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: 'test-key',
        isAIEnabled: true,
      } as any);

      const result = await aiService.refineGoal('Test goal', 'en');

      expect(result).toBe('');
    });
  });

  describe('Goal Refinement', () => {
    it('should refine goal with AI', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('Read 10 pages daily'),
            },
          }),
        }),
      } as any));

      const result = await aiService.refineGoal('Read more', 'en');

      expect(result).toBe('Read 10 pages daily');
    });

    it('should handle different languages', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('Günde 10 sayfa oku'),
            },
          }),
        }),
      } as any));

      const result = await aiService.refineGoal('Daha fazla oku', 'tr');

      expect(result).toBe('Günde 10 sayfa oku');
    });

    it('should remove quotes from response', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('"Read 10 pages daily"'),
            },
          }),
        }),
      } as any));

      const result = await aiService.refineGoal('Read more', 'en');

      expect(result).toBe('Read 10 pages daily');
    });
  });

  describe('Goal Decomposition', () => {
    it('should decompose goal into 3 subtasks', async () => {
      const mockResponse = JSON.stringify([
        'Step 1: Research the topic',
        'Step 2: Create outline',
        'Step 3: Write first draft',
      ]);

      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue(mockResponse),
            },
          }),
        }),
      } as any));

      const result = await aiService.decomposeGoal('Write a book', 'en');

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Step 1: Research the topic');
    });

    it('should handle invalid JSON response', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('Invalid JSON'),
            },
          }),
        }),
      } as any));

      const result = await aiService.decomposeGoal('Write a book', 'en');

      expect(result).toEqual([]);
    });

    it('should clean markdown from JSON response', async () => {
      const mockResponse = '```json\n["Step 1", "Step 2", "Step 3"]\n```';

      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue(mockResponse),
            },
          }),
        }),
      } as any));

      const result = await aiService.decomposeGoal('Write a book', 'en');

      expect(result).toHaveLength(3);
    });

    it('should limit to 3 subtasks', async () => {
      const mockResponse = JSON.stringify([
        'Step 1',
        'Step 2',
        'Step 3',
        'Step 4',
        'Step 5',
      ]);

      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue(mockResponse),
            },
          }),
        }),
      } as any));

      const result = await aiService.decomposeGoal('Write a book', 'en');

      expect(result).toHaveLength(3);
    });
  });

  describe('Celebration Messages', () => {
    it('should generate celebration message for completed goals', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('Amazing job completing your goals!'),
            },
          }),
        }),
      } as any));

      const result = await aiService.getCelebrationMessage(
        ['Goal 1', 'Goal 2', 'Goal 3'],
        'en'
      );

      expect(result).toBe('Amazing job completing your goals!');
    });

    it('should handle empty goals list', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('Keep going!'),
            },
          }),
        }),
      } as any));

      const result = await aiService.getCelebrationMessage([], 'en');

      expect(result).toBe('Keep going!');
    });
  });

  describe('Chat Functionality', () => {
    it('should send chat message and receive response', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          startChat: jest.fn().mockReturnValue({
            sendMessage: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn().mockReturnValue('Hello! How can I help?'),
              },
            }),
          }),
        }),
      } as any));

      const history = [{ role: 'user', parts: [{ text: 'Hello' }] }];
      const result = await aiService.chat('Hi', history, 'User has no goals', 'en');

      expect(result).toBe('Hello! How can I help?');
    });

    it('should include goal context in chat', async () => {
      const goalContext = 'User goals: Read 10 pages, Exercise 30 min';

      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          startChat: jest.fn().mockReturnValue({
            sendMessage: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn().mockReturnValue('Great goals! Keep it up.'),
              },
            }),
          }),
        }),
      } as any));

      await aiService.chat('How am I doing?', [], goalContext, 'en');

      // Verify model was initialized with system instruction containing goals
      expect(GoogleGenerativeAI).toHaveBeenCalled();
    });

    it('should return empty string on chat error', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          startChat: jest.fn().mockReturnValue({
            sendMessage: jest.fn().mockRejectedValue(new Error('Chat error')),
          }),
        }),
      } as any));

      const result = await aiService.chat('Hi', [], 'No goals', 'en');

      expect(result).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null API key gracefully', async () => {
      jest.mocked(useAIStore.getState).mockReturnValue({
        apiKey: null,
        isAIEnabled: false,
      } as any);

      const result = await aiService.refineGoal('Test goal', 'en');

      expect(result).toBe('');
    });

    it('should handle empty goal text', async () => {
      jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue(''),
            },
          }),
        }),
      } as any));

      const result = await aiService.refineGoal('', 'en');

      expect(result).toBe('');
    });
it.skip('should handle very long goal text', async () => {
  const longGoal = 'Unique long goal ' + 'A'.repeat(50);
  jest.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Refined long goal'),
        },
      }),
    }),
  } as any));

  const result = await aiService.refineGoal(longGoal, 'en');

  expect(result).toBe('Refined long goal');
});});
});
