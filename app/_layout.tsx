import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen as RouterSplashScreen } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppColorScheme } from "../src/hooks/useAppColorScheme";
import { ThemeProvider as CustomThemeProvider } from "../src/components/ThemeProvider";

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
// Use try/catch instead of .catch() to handle potential issues
try {
  SplashScreen.preventAutoHideAsync();
} catch (error) {
  // Ignore errors - this means the splash screen has already been hidden
  console.log("SplashScreen.preventAutoHideAsync() failed", error);
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
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

  useEffect(() => {
    const prepare = async () => {
      try {
        // Keep the splash screen visible while we prepare resources
        // Avoid calling preventAutoHideAsync again as it's already called above

        // Wait for fonts to load or fail
        if (loaded || fontError) {
          // Hide the splash screen with try/catch
          try {
            await SplashScreen.hideAsync();
          } catch (e) {
            console.log("Error hiding splash screen:", e);
            // Ignore errors if splash screen is already hidden
          }
          setIsReady(true);
        }
      } catch (e) {
        console.error("Error in preparation:", e);
        setIsReady(true); // Continue anyway to show the app
      }
    };

    prepare();
  }, [loaded, fontError]);

  if (!isReady) {
    return null;
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
        <Stack>
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
