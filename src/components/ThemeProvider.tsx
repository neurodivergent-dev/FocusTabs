import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useColorScheme, StyleSheet, View } from "react-native";
import { useThemeStore } from "../store/themeStore";
import { ThemeOption } from "../constants/themes";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  Easing,
  interpolate
} from "react-native-reanimated";

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

  // Transition state
  const contentOpacity = useSharedValue(1);
  const [prevColors, setPrevColors] = useState(colors);
  const prevThemeIdRef = useRef(themeId);
  const prevIsDarkRef = useRef(isDarkMode);

  // Detect theme changes
  useEffect(() => {
    if (prevThemeIdRef.current !== themeId || prevIsDarkRef.current !== isDarkMode) {
      // 1. İçeriği anında görünmez yap (Hızla)
      contentOpacity.value = 0;
      
      // 2. Çok kısa bir süre sonra yumuşakça geri getir
      contentOpacity.value = withTiming(1, { 
        duration: 500, 
        easing: Easing.out(Easing.quad) 
      });

      // Ref'leri ve önceki renkleri güncelle
      setPrevColors(colors);
      prevThemeIdRef.current = themeId;
      prevIsDarkRef.current = isDarkMode;
    }
  }, [themeId, isDarkMode]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Sistem renk şeması değiştiğinde güncelle
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode, setIsDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDarkMode,
        themeId,
      }}
    >
      {/* 
          BU YAPI KARARMAYI ENGELLER:
          Arka planda her zaman bir renk (eski veya yeni) vardır.
          İçerik bu rengin üzerinde parlar.
      */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.container, animatedContentStyle]}>
          {children}
        </Animated.View>
      </View>
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    zIndex: 9999,
  },
});

export default ThemeProvider;
