import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface ChatMessage {
  id: string;
  text: string;
  role: 'user' | 'model';
  timestamp: number;
}

interface AIState {
  apiKey: string | null;
  isAIEnabled: boolean;
  lastCelebrationMessage: string | null;
  lastCelebrationDate: string | null;
  chatMessages: ChatMessage[];
  customSystemPrompt: string | null;
  pollinationsApiKey: string | null;
  setApiKey: (key: string | null) => Promise<void>;
  setPollinationsApiKey: (key: string | null) => Promise<void>;
  loadApiKey: () => Promise<void>;
  toggleAI: (enabled: boolean) => Promise<void>;
  setCelebrationCache: (message: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  setCustomSystemPrompt: (prompt: string | null) => void;
}

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const POLLINATIONS_API_KEY_STORAGE_KEY = 'pollinations_api_key';
const AI_ENABLED_STORAGE_KEY = 'ai_enabled_status';

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      apiKey: null,
      isAIEnabled: false,
      lastCelebrationMessage: null,
      lastCelebrationDate: null,
      chatMessages: [],
      customSystemPrompt: null,
      pollinationsApiKey: null,

      setApiKey: async (key: string | null) => {
        if (key) {
          await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
          await SecureStore.setItemAsync(AI_ENABLED_STORAGE_KEY, 'true');
          set({ apiKey: key, isAIEnabled: true });
        } else {
          await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
          await SecureStore.setItemAsync(AI_ENABLED_STORAGE_KEY, 'false');
          set({ apiKey: null, isAIEnabled: false });
        }
      },

      setPollinationsApiKey: async (key: string | null) => {
        if (key) {
          await SecureStore.setItemAsync(POLLINATIONS_API_KEY_STORAGE_KEY, key);
          set({ pollinationsApiKey: key });
        } else {
          await SecureStore.deleteItemAsync(POLLINATIONS_API_KEY_STORAGE_KEY);
          set({ pollinationsApiKey: null });
        }
      },

      loadApiKey: async () => {
        try {
          const key = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
          const pKey = await SecureStore.getItemAsync(POLLINATIONS_API_KEY_STORAGE_KEY);
          const enabledStatus = await SecureStore.getItemAsync(AI_ENABLED_STORAGE_KEY);
          const isEnabled = key ? (enabledStatus === null ? true : enabledStatus === 'true') : false;
          set({ apiKey: key, pollinationsApiKey: pKey, isAIEnabled: isEnabled });
        } catch (e) {
          console.error('AI ayarları yüklenemedi:', e);
        }
      },

      toggleAI: async (enabled: boolean) => {
        await SecureStore.setItemAsync(AI_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
        set({ isAIEnabled: enabled });
      },

      setCelebrationCache: (message: string) => {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        set({ lastCelebrationMessage: message, lastCelebrationDate: today });
      },

      addChatMessage: (message: ChatMessage) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, message].slice(-50), // Son 50 mesajı tut
        }));
      },

      clearChatMessages: () => {
        set({ chatMessages: [] });
      },

      setCustomSystemPrompt: (prompt: string | null) => {
        set({ customSystemPrompt: prompt });
      },
    }),
    {
      name: 'ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Sadece bu alanları persist et (API key SecureStore'da olduğu için burada tutmuyoruz)
      partialize: (state) => ({ 
        isAIEnabled: state.isAIEnabled,
        lastCelebrationMessage: state.lastCelebrationMessage,
        lastCelebrationDate: state.lastCelebrationDate,
        chatMessages: state.chatMessages,
        customSystemPrompt: state.customSystemPrompt
      }),
    }
  )
);
