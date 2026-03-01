import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AIState {
  apiKey: string | null;
  isAIEnabled: boolean;
  lastCelebrationMessage: string | null;
  lastCelebrationDate: string | null;
  setApiKey: (key: string | null) => Promise<void>;
  loadApiKey: () => Promise<void>;
  toggleAI: (enabled: boolean) => Promise<void>;
  setCelebrationCache: (message: string) => void;
}

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const AI_ENABLED_STORAGE_KEY = 'ai_enabled_status';

export const useAIStore = create<AIState>((set, get) => ({
  apiKey: null,
  isAIEnabled: false,
  lastCelebrationMessage: null,
  lastCelebrationDate: null,

  setApiKey: async (key: string | null) => {
    if (key) {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
      // When setting a key for the first time, we usually want to enable it
      await SecureStore.setItemAsync(AI_ENABLED_STORAGE_KEY, 'true');
      set({ apiKey: key, isAIEnabled: true });
    } else {
      await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
      await SecureStore.setItemAsync(AI_ENABLED_STORAGE_KEY, 'false');
      set({ apiKey: null, isAIEnabled: false });
    }
  },

  loadApiKey: async () => {
    try {
      const key = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
      const enabledStatus = await SecureStore.getItemAsync(AI_ENABLED_STORAGE_KEY);
      
      // If we have a key, we check the saved status. Default to true if key exists but status is not set.
      const isEnabled = key ? (enabledStatus === null ? true : enabledStatus === 'true') : false;
      
      set({ 
        apiKey: key, 
        isAIEnabled: isEnabled 
      });
    } catch (e) {
      console.error('AI ayarları yüklenemedi:', e);
    }
  },

  toggleAI: async (enabled: boolean) => {
    await SecureStore.setItemAsync(AI_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
    set({ isAIEnabled: enabled });
  },

  setCelebrationCache: (message: string) => {
    const today = new Date().toISOString().split('T')[0];
    set({ lastCelebrationMessage: message, lastCelebrationDate: today });
  },
}));
