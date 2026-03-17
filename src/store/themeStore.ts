import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeOption, getThemeById, getThemeByIdAndMode } from '../constants/themes';

type ThemeMode = 'light' | 'dark' | 'system';
export type BackgroundEffectType = 'none' | 'shapes' | 'particles' | 'waves' | 'crystals' | 'tesseract' | 'dynamic';

interface ThemeState {
  // Tema ayarları
  themeMode: ThemeMode;
  isDarkMode: boolean;
  themeId: string; // Tema renk kimliği
  colors: ThemeOption['colors']; // Aktif tema renkleri
  soundsEnabled: boolean;
  backgroundEffect: BackgroundEffectType;
  customBackgroundConfig: any | null; // AI-generated background config
  customThemes: ThemeOption[]; // AI veya kullanıcı tarafından eklenen temalar
  
  // Tema ayarlama metodları
  setThemeMode: (mode: ThemeMode) => void;
  setIsDarkMode: (isDark: boolean) => void;
  toggleTheme: () => void;
  setThemeId: (id: string) => void; // Yeni tema rengi seçme
  addCustomTheme: (theme: ThemeOption) => void; // Yeni tema ekleme
  setSoundsEnabled: (enabled: boolean) => void;
  setBackgroundEffect: (effect: BackgroundEffectType) => void;
  setCustomBackgroundConfig: (config: any) => void; // Dynamically set background config
  triggerSound: (type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer') => void;
  soundTrigger: { type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer', timestamp: number } | null;
  getActiveTheme: () => ThemeOption; // Aktif temayı alma
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      isDarkMode: false,
      themeId: 'default',
      colors: getThemeById('default').colors,
      soundsEnabled: true,
      soundTrigger: null,
      backgroundEffect: 'shapes',
      customBackgroundConfig: null,
      customThemes: [],
      
      setThemeMode: (mode: ThemeMode) => set({ 
        themeMode: mode 
      }),
      
      setIsDarkMode: (isDark: boolean) => {
        const state = get();
        const allThemes = [...ThemeConstants.THEMES, ...state.customThemes];
        const theme = allThemes.find(t => t.id === state.themeId) || allThemes[0];
        
        let colors = theme.colors;
        if (!isDark && theme.id !== 'custom-ai') { // Sadece varsayılan temalar için otomatik light mode
           colors = {
             ...ThemeConstants.lightBase,
             primary: theme.colors.primary,
             secondary: theme.colors.secondary,
           } as any;
        }

        set({ 
          isDarkMode: isDark,
          colors: colors
        });
      },
      
      toggleTheme: () => {
        const state = get();
        const newIsDarkMode = !state.isDarkMode;
        state.setIsDarkMode(newIsDarkMode);
      },
      
      setThemeId: (id: string) => {
        const state = get();
        const allThemes = [...ThemeConstants.THEMES, ...state.customThemes];
        const theme = allThemes.find(t => t.id === id) || allThemes[0];
        
        set({ 
          themeId: id,
          colors: theme.colors
        });
      },

      addCustomTheme: (theme: ThemeOption) => {
        set(state => ({
          customThemes: [theme, ...state.customThemes.filter(t => t.id !== theme.id)].slice(0, 5), // Son 5 temayı tut
          themeId: theme.id,
          colors: theme.colors
        }));
      },

      setSoundsEnabled: (enabled: boolean) => set({ 
        soundsEnabled: enabled 
      }),

      setBackgroundEffect: (effect: BackgroundEffectType) => set({ 
        backgroundEffect: effect 
      }),

      setCustomBackgroundConfig: (config: any) => set({
        customBackgroundConfig: config,
        backgroundEffect: 'dynamic' as any // Switch to dynamic mode automatically
      }),

      triggerSound: (type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer') => set({ 
        soundTrigger: { type, timestamp: Date.now() } 
      }),

      getActiveTheme: () => {
        const state = get();
        const allThemes = [...ThemeConstants.THEMES, ...state.customThemes];
        const theme = allThemes.find(t => t.id === state.themeId) || allThemes[0];
        return theme;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 

// Helper for access to static constants
const ThemeConstants = {
  THEMES: require('../constants/themes').THEMES as ThemeOption[],
  lightBase: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.05)',
    text: '#1C1C1E',
    subText: '#8E8E93',
    border: 'rgba(0, 0, 0, 0.05)',
    success: '#34C759',
    warning: '#FFCC00',
    error: '#FF3B30',
    info: '#007AFF',
  }
}; 