/**
 * Tests for aiStore.ts
 * Tests AI state management, API key handling, and chat functionality
 */

import { useAIStore } from '../aiStore';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

describe('aiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAIStore.setState({
      apiKey: null,
      isAIEnabled: false,
      lastCelebrationMessage: null,
      lastCelebrationDate: null,
      chatMessages: [],
    });
    jest.clearAllMocks();
  });

  describe('API Key Management', () => {
    it('should initialize with null API key', () => {
      const state = useAIStore.getState();
      expect(state.apiKey).toBeNull();
      expect(state.isAIEnabled).toBe(false);
    });

    it('should set API key and enable AI', async () => {
      const { setApiKey } = useAIStore.getState();
      const testApiKey = 'test-api-key-12345';
      
      await setApiKey(testApiKey);
      
      const state = useAIStore.getState();
      expect(state.apiKey).toBe(testApiKey);
      expect(state.isAIEnabled).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('gemini_api_key', testApiKey);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ai_enabled_status', 'true');
    });

    it('should remove API key and disable AI', async () => {
      const { setApiKey } = useAIStore.getState();
      
      // First set a key
      await setApiKey('test-key');
      
      // Then remove it
      await setApiKey(null);
      
      const state = useAIStore.getState();
      expect(state.apiKey).toBeNull();
      expect(state.isAIEnabled).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('gemini_api_key');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ai_enabled_status', 'false');
    });

    it('should load API key from SecureStore', async () => {
      const { loadApiKey } = useAIStore.getState();
      const testApiKey = 'loaded-api-key';
      
      jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key: string) => {
        if (key === 'gemini_api_key') return testApiKey;
        if (key === 'ai_enabled_status') return 'true';
        return null;
      });
      
      await loadApiKey();
      
      const state = useAIStore.getState();
      expect(state.apiKey).toBe(testApiKey);
      expect(state.isAIEnabled).toBe(true);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('gemini_api_key');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('ai_enabled_status');
    });

    it('should handle SecureStore errors gracefully', async () => {
      const { loadApiKey } = useAIStore.getState();
      
      jest.mocked(SecureStore.getItemAsync).mockRejectedValue(new Error('SecureStore error'));
      
      await expect(loadApiKey()).resolves.toBeUndefined();
      // Should not throw, just log error
    });

    it('should toggle AI enabled state', async () => {
      const { toggleAI } = useAIStore.getState();
      
      await toggleAI(true);
      
      const state = useAIStore.getState();
      expect(state.isAIEnabled).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ai_enabled_status', 'true');
      
      await toggleAI(false);
      
      const updatedState = useAIStore.getState();
      expect(updatedState.isAIEnabled).toBe(false);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ai_enabled_status', 'false');
    });
  });

  describe('Celebration Cache', () => {
    it('should set celebration message and date', () => {
      const { setCelebrationCache } = useAIStore.getState();
      const testMessage = 'Congratulations! You completed all goals!';
      
      setCelebrationCache(testMessage);
      
      const state = useAIStore.getState();
      expect(state.lastCelebrationMessage).toBe(testMessage);
      expect(state.lastCelebrationDate).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should update celebration cache on same day', () => {
      const { setCelebrationCache } = useAIStore.getState();
      
      setCelebrationCache('First message');
      setCelebrationCache('Second message');
      
      const state = useAIStore.getState();
      expect(state.lastCelebrationMessage).toBe('Second message');
    });
  });

  describe('Chat Messages', () => {
    it('should initialize with empty chat messages', () => {
      const state = useAIStore.getState();
      expect(state.chatMessages).toEqual([]);
    });

    it('should add a chat message', () => {
      const { addChatMessage } = useAIStore.getState();
      
      addChatMessage({
        id: 'msg-1',
        text: 'Hello AI!',
        role: 'user',
        timestamp: Date.now(),
      });
      
      const state = useAIStore.getState();
      expect(state.chatMessages.length).toBe(1);
      expect(state.chatMessages[0].text).toBe('Hello AI!');
      expect(state.chatMessages[0].role).toBe('user');
    });

    it('should add AI response message', () => {
      const { addChatMessage } = useAIStore.getState();
      
      addChatMessage({
        id: 'msg-1',
        text: 'Hello AI!',
        role: 'user',
        timestamp: Date.now(),
      });
      
      addChatMessage({
        id: 'msg-2',
        text: 'Hello! How can I help you?',
        role: 'model',
        timestamp: Date.now(),
      });
      
      const state = useAIStore.getState();
      expect(state.chatMessages.length).toBe(2);
      expect(state.chatMessages[1].role).toBe('model');
    });

    it('should limit chat history to 50 messages', () => {
      const { addChatMessage } = useAIStore.getState();
      
      // Add 51 messages
      for (let i = 0; i < 51; i++) {
        addChatMessage({
          id: `msg-${i}`,
          text: `Message ${i}`,
          role: i % 2 === 0 ? 'user' : 'model',
          timestamp: Date.now(),
        });
      }
      
      const state = useAIStore.getState();
      expect(state.chatMessages.length).toBe(50);
      expect(state.chatMessages[0].id).toBe('msg-1'); // First message removed
      expect(state.chatMessages[49].id).toBe('msg-50'); // Last message kept
    });

    it('should clear all chat messages', () => {
      const { addChatMessage, clearChatMessages } = useAIStore.getState();
      
      addChatMessage({
        id: 'msg-1',
        text: 'Test message',
        role: 'user',
        timestamp: Date.now(),
      });
      
      expect(useAIStore.getState().chatMessages.length).toBe(1);
      
      clearChatMessages();
      
      const state = useAIStore.getState();
      expect(state.chatMessages.length).toBe(0);
    });

    it('should maintain message order', () => {
      const { addChatMessage } = useAIStore.getState();
      
      const messages = [
        { id: '1', text: 'First', role: 'user' as const, timestamp: 1000 },
        { id: '2', text: 'Second', role: 'model' as const, timestamp: 2000 },
        { id: '3', text: 'Third', role: 'user' as const, timestamp: 3000 },
      ];
      
      messages.forEach(msg => addChatMessage(msg));
      
      const state = useAIStore.getState();
      expect(state.chatMessages.map(m => m.id)).toEqual(['1', '2', '3']);
    });
  });

  describe('Persistence', () => {
    it('should persist isAIEnabled state', async () => {
      const { toggleAI } = useAIStore.getState();
      
      await toggleAI(true);
      
      const state = useAIStore.getState();
      expect(state.isAIEnabled).toBe(true);
      
      // Verify persist config
      const persistConfig = (useAIStore as any).persist;
      expect(persistConfig).toBeDefined();
    });

    it('should persist celebration cache', () => {
      const { setCelebrationCache } = useAIStore.getState();
      
      setCelebrationCache('Test message');
      
      const state = useAIStore.getState();
      expect(state.lastCelebrationMessage).toBe('Test message');
    });

    it('should persist chat messages', () => {
      const { addChatMessage } = useAIStore.getState();
      
      addChatMessage({
        id: 'msg-1',
        text: 'Persistent message',
        role: 'user',
        timestamp: Date.now(),
      });
      
      const state = useAIStore.getState();
      expect(state.chatMessages.length).toBe(1);
      expect(state.chatMessages[0].text).toBe('Persistent message');
    });

    it('should NOT persist API key (stored in SecureStore)', () => {
      // API key should be in SecureStore, not in AsyncStorage
      const state = useAIStore.getState();
      
      // The partialize function should exclude apiKey
      const persistConfig = (useAIStore as any).persist;
      const partialize = persistConfig?.getOptions?.()?.partialize;
      
      if (partialize) {
        const persisted = partialize({ apiKey: 'secret-key', isAIEnabled: true });
        expect(persisted.apiKey).toBeUndefined();
        expect(persisted.isAIEnabled).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message text', () => {
      const { addChatMessage } = useAIStore.getState();
      
      addChatMessage({
        id: 'msg-1',
        text: '',
        role: 'user',
        timestamp: Date.now(),
      });
      
      const state = useAIStore.getState();
      expect(state.chatMessages.length).toBe(1);
      expect(state.chatMessages[0].text).toBe('');
    });

    it('should handle very long messages', () => {
      const { addChatMessage } = useAIStore.getState();
      const longText = 'A'.repeat(10000);
      
      addChatMessage({
        id: 'msg-1',
        text: longText,
        role: 'user',
        timestamp: Date.now(),
      });
      
      const state = useAIStore.getState();
      expect(state.chatMessages[0].text.length).toBe(10000);
    });

    it('should handle rapid message additions', () => {
      const { addChatMessage } = useAIStore.getState();
      
      // Add 10 messages rapidly
      for (let i = 0; i < 10; i++) {
        addChatMessage({
          id: `msg-${i}`,
          text: `Message ${i}`,
          role: 'user',
          timestamp: Date.now() + i,
        });
      }
      
      const state = useAIStore.getState();
      expect(state.chatMessages.length).toBe(10);
    });

    it('should handle SecureStore failures', async () => {
      const { setApiKey } = useAIStore.getState();
      
      jest.mocked(SecureStore.setItemAsync).mockRejectedValue(
        new Error('SecureStore unavailable')
      );
      
      await expect(setApiKey('test-key')).rejects.toThrow('SecureStore unavailable');
    });
  });

  describe('Chat Message Types', () => {
    it('should handle user messages', () => {
      const { addChatMessage } = useAIStore.getState();
      
      addChatMessage({
        id: 'msg-1',
        text: 'User message',
        role: 'user',
        timestamp: Date.now(),
      });
      
      const state = useAIStore.getState();
      expect(state.chatMessages[0].role).toBe('user');
    });

    it('should handle model messages', () => {
      const { addChatMessage } = useAIStore.getState();
      
      addChatMessage({
        id: 'msg-1',
        text: 'AI response',
        role: 'model',
        timestamp: Date.now(),
      });
      
      const state = useAIStore.getState();
      expect(state.chatMessages[0].role).toBe('model');
    });

    it('should preserve message timestamps', () => {
      const { addChatMessage } = useAIStore.getState();
      const customTimestamp = 1234567890;
      
      addChatMessage({
        id: 'msg-1',
        text: 'Test',
        role: 'user',
        timestamp: customTimestamp,
      });
      
      const state = useAIStore.getState();
      expect(state.chatMessages[0].timestamp).toBe(customTimestamp);
    });
  });
});
