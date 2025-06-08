import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeOption, getThemeById, getThemeByIdAndMode } from '../constants/themes';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  // Tema ayarları
  themeMode: ThemeMode;
  isDarkMode: boolean;
  themeId: string; // Tema renk kimliği
  colors: ThemeOption['colors']; // Aktif tema renkleri
  
  // Tema ayarlama metodları
  setThemeMode: (mode: ThemeMode) => void;
  setIsDarkMode: (isDark: boolean) => void;
  toggleTheme: () => void;
  setThemeId: (id: string) => void; // Yeni tema rengi seçme
  getActiveTheme: () => ThemeOption; // Aktif temayı alma
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      isDarkMode: false,
      themeId: 'default',
      colors: getThemeById('default').colors,
      
      setThemeMode: (mode: ThemeMode) => set({ 
        themeMode: mode 
      }),
      
      setIsDarkMode: (isDark: boolean) => {
        const state = get();
        const theme = getThemeByIdAndMode(state.themeId, isDark);
        
        set({ 
          isDarkMode: isDark,
          colors: theme.colors
        });
      },
      
      toggleTheme: () => {
        const state = get();
        const newIsDarkMode = !state.isDarkMode;
        const theme = getThemeByIdAndMode(state.themeId, newIsDarkMode);
        
        set({ 
          isDarkMode: newIsDarkMode,
          colors: theme.colors
        });
      },
      
      setThemeId: (id: string) => {
        const state = get();
        const theme = getThemeByIdAndMode(id, state.isDarkMode);
        
        set({ 
          themeId: id,
          colors: theme.colors
        });
      },
      
      getActiveTheme: () => {
        const state = get();
        return getThemeByIdAndMode(state.themeId, state.isDarkMode);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 