import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AIState {
  apiKey: string | null;
  isAIEnabled: boolean;
  lastCelebrationMessage: string | null;
  lastCelebrationDate: string | null;
  setApiKey: (key: string | null) => Promise<void>;
  loadApiKey: () => Promise<void>;
  toggleAI: (enabled: boolean) => void;
  setCelebrationCache: (message: string) => void;
}

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const useAIStore = create<AIState>((set) => ({
  apiKey: null,
  isAIEnabled: false,
  lastCelebrationMessage: null,
  lastCelebrationDate: null,

  setApiKey: async (key: string | null) => {
    if (key) {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
      set({ apiKey: key, isAIEnabled: true });
    } else {
      await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
      set({ apiKey: null, isAIEnabled: false });
    }
  },

  loadApiKey: async () => {
    try {
      const key = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
      if (key) {
        set({ apiKey: key, isAIEnabled: true });
      }
    } catch (e) {
      console.error('API anahtarı yüklenemedi:', e);
    }
  },

  toggleAI: (enabled: boolean) => {
    set({ isAIEnabled: enabled });
  },

  setCelebrationCache: (message: string) => {
    const today = new Date().toISOString().split('T')[0];
    set({ lastCelebrationMessage: message, lastCelebrationDate: today });
  },
}));
