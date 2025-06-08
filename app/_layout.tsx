import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useAppColorScheme } from "../src/hooks/useAppColorScheme";
import { ThemeProvider as CustomThemeProvider } from "../src/components/ThemeProvider";

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [fontError, setFontError] = useState<Error | null>(null);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...(FontAwesome.font || {}),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      setFontError(error);
    }
  }, [error]);

  // Wait for fonts to load before rendering the app
  if (!loaded && !fontError) {
    return null; // Expo will maintain the splash screen until we return something
  }

  // If there was a font loading error, render the app anyway
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useAppColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  // Handle case where theme might be undefined
  const safeTheme = theme || DefaultTheme;

  return (
    <CustomThemeProvider>
      <ThemeProvider value={safeTheme}>
        <Stack
          screenOptions={{
            // Varsayılan sayfa arka plan rengi için ThemeProvider'dan değer kullan
            contentStyle: {
              backgroundColor: colorScheme === "dark" ? "#121212" : "#FFFFFF",
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});
