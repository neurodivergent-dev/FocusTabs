import React, { ReactNode, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/themeStore";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { themeMode, setIsDarkMode } = useThemeStore();

  // Update dark mode state based on system changes when using system theme
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode, setIsDarkMode]);

  return <>{children}</>;
};
