import React, { createContext, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/themeStore";
import { ThemeOption } from "../constants/themes";

// Tema içeriği türü
interface ThemeContextType {
  colors: ThemeOption["colors"];
  isDarkMode: boolean;
  themeId: string;
}

// Tema bağlamı oluşturma
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Tema bağlamını kullanmak için hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const themeId = useThemeStore((state) => state.themeId);
  const colors = useThemeStore((state) => state.colors);
  const setIsDarkMode = useThemeStore((state) => state.setIsDarkMode);

  // Sistem renk şeması değiştiğinde ve tema sistem olarak ayarlandığında
  // temayı güncelleme
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode, setIsDarkMode]);

  // ThemeContext Provider ile çocuk bileşenleri sarma
  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDarkMode,
        themeId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
