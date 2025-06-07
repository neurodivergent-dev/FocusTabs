import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useEffect } from 'react';

export const useAppColorScheme = () => {
  const systemColorScheme = useColorScheme();
  const { themeMode, isDarkMode, setIsDarkMode } = useThemeStore();
  
  // Update isDarkMode when system theme changes if themeMode is 'system'
  useEffect(() => {
    if (themeMode === 'system' && systemColorScheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode, setIsDarkMode]);

  // Return the appropriate color scheme based on the theme mode
  if (themeMode === 'system') {
    return systemColorScheme || 'light';
  }
  
  return isDarkMode ? 'dark' : 'light';
}; 