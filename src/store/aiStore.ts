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
  groqApiKey: string | null;
  activeProvider: 'gemini' | 'groq';
  groqModel: string;
  isAIEnabled: boolean;
  lastCelebrationMessage: string | null;
  lastCelebrationDate: string | null;
  chatMessages: ChatMessage[];
  customSystemPrompt: string | null;
  pollinationsApiKey: string | null;
  chatSoundsEnabled: boolean;
  chatSoundType: 'pop' | 'digital' | 'minimal';
  setApiKey: (key: string | null) => Promise<void>;
  setGroqKey: (key: string | null) => Promise<void>;
  setPollinationsApiKey: (key: string | null) => Promise<void>;
  setActiveProvider: (provider: 'gemini' | 'groq') => void;
  setGroqModel: (model: string) => void;
  loadApiKey: () => Promise<void>;
  toggleAI: (enabled: boolean) => Promise<void>;
  setCelebrationCache: (message: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  deleteChatMessage: (id: string) => void;
  deleteChatMessages: (ids: string[]) => void;
  setCustomSystemPrompt: (prompt: string | null) => void;
  setChatSoundsEnabled: (enabled: boolean) => void;
  setChatSoundType: (type: 'pop' | 'digital' | 'minimal') => void;
}

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const POLLINATIONS_API_KEY_STORAGE_KEY = 'pollinations_api_key';
const AI_ENABLED_STORAGE_KEY = 'ai_enabled_status';

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      apiKey: null,
      groqApiKey: null,
      activeProvider: 'gemini',
      groqModel: 'llama-3.1-8b-instant',
      isAIEnabled: false,
      lastCelebrationMessage: null,
      lastCelebrationDate: null,
      chatMessages: [],
      customSystemPrompt: null,
      pollinationsApiKey: null,
      chatSoundsEnabled: true,
      chatSoundType: 'pop',

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

      setGroqKey: async (key: string | null) => {
        if (key) {
          await SecureStore.setItemAsync('groq_api_key', key);
          set({ groqApiKey: key });
        } else {
          await SecureStore.deleteItemAsync('groq_api_key');
          set({ groqApiKey: null });
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

      setActiveProvider: (provider: 'gemini' | 'groq') => set({ activeProvider: provider }),
      setGroqModel: (model: string) => set({ groqModel: model }),

      loadApiKey: async () => {
        try {
          const key = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
          const gKey = await SecureStore.getItemAsync('groq_api_key');
          const pKey = await SecureStore.getItemAsync(POLLINATIONS_API_KEY_STORAGE_KEY);
          const enabledStatus = await SecureStore.getItemAsync(AI_ENABLED_STORAGE_KEY);
          const isEnabled = (key || gKey) ? (enabledStatus === null ? true : enabledStatus === 'true') : false;
          set({ apiKey: key, groqApiKey: gKey, pollinationsApiKey: pKey, isAIEnabled: isEnabled });
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

      deleteChatMessage: (id: string) => {
        set((state) => ({
          chatMessages: state.chatMessages.filter((msg) => msg.id !== id),
        }));
      },

      deleteChatMessages: (ids: string[]) => {
        set((state) => ({
          chatMessages: state.chatMessages.filter((msg) => !ids.includes(msg.id)),
        }));
      },

      setCustomSystemPrompt: (prompt: string | null) => {
        set({ customSystemPrompt: prompt });
      },
      setChatSoundsEnabled: (enabled: boolean) => set({ chatSoundsEnabled: enabled }),
      setChatSoundType: (type: 'pop' | 'digital' | 'minimal') => set({ chatSoundType: type }),
    }),
    {
      name: 'ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        isAIEnabled: state.isAIEnabled,
        activeProvider: state.activeProvider,
        groqModel: state.groqModel,
        lastCelebrationMessage: state.lastCelebrationMessage,
        lastCelebrationDate: state.lastCelebrationDate,
        chatMessages: state.chatMessages,
        customSystemPrompt: state.customSystemPrompt,
        chatSoundsEnabled: state.chatSoundsEnabled,
        chatSoundType: state.chatSoundType,
      }),
    }
  )
);
