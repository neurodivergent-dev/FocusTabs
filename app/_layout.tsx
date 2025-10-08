import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View as _View, Text as _Text } from "react-native";
import { useAppColorScheme } from "../src/hooks/useAppColorScheme";
import { ThemeProvider as CustomThemeProvider } from "../src/components/ThemeProvider";
import { useLanguageStore } from "../src/store/languageStore";
import { useOnboardingStore } from "../src/store/onboardingStore";
import { useUserStore } from "../src/store/userStore";
import "../src/i18n/i18n"; // Import i18n initialization

// Check if in development mode
const isDevelopment = __DEV__;

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [fontError, setFontError] = useState<Error | null>(null);
  const [i18nInitialized, setI18nInitialized] = useState(false);

  // Get the current language from the store to ensure it's loaded
  const { currentLanguage } = useLanguageStore();

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

  // Mark i18n as initialized once we have the language
  useEffect(() => {
    if (currentLanguage) {
      setI18nInitialized(true);
    }
  }, [currentLanguage]);

  // Wait for fonts to load and i18n to initialize before rendering the app
  if ((!loaded && !fontError) || !i18nInitialized) {
    return null; // Expo will maintain the splash screen until we return something
  }

  // If there was a font loading error, render the app anyway
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useAppColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const segments = useSegments();
  const { hasCompletedOnboarding } = useOnboardingStore();
  const { isLoggedIn, isGuest } = useUserStore();
  const [allowLoginScreen, setAllowLoginScreen] = useState(false);

  // Track when user is intentionally navigating to login
  useEffect(() => {
    // Create a combined path from all segments
    const path = segments.join("/");

    // Detect if we're on the login screen
    if (path.includes("login")) {
      setAllowLoginScreen(true);
    }
    // Reset when we leave login screens
    else if (
      !path.includes("login") &&
      !path.includes("register") &&
      !path.includes("forgot-password")
    ) {
      setAllowLoginScreen(false);
    }
  }, [segments]);

  // Handle routing based on authentication and onboarding status
  useEffect(() => {
    // Convert segments to a string to check the path
    const path = segments.join("/");

    const inOnboarding = path.includes("onboarding");
    const inLoginFlow =
      path.includes("login") ||
      path.includes("register") ||
      path.includes("forgot-password");

    // If onboarding is not completed, redirect to onboarding
    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace("/onboarding");
      return;
    }

    // If onboarding is completed but not logged in and not in guest mode, redirect to login
    // unless already on a login-related page
    if (
      hasCompletedOnboarding &&
      !isLoggedIn &&
      !isGuest &&
      !inLoginFlow &&
      !inOnboarding
    ) {
      router.replace("/login");
      return;
    }

    // If logged in or in guest mode but on a login page, redirect to home
    // EXCEPT when we've explicitly allowed the login screen (from settings)
    if ((isLoggedIn || isGuest) && inLoginFlow && !allowLoginScreen) {
      router.replace("/(tabs)");
      return;
    }
  }, [segments, hasCompletedOnboarding, isLoggedIn, isGuest, allowLoginScreen]);

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
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen
            name="forgot-password"
            options={{ headerShown: false }}
          />
          {/* Only show debug screens in development mode */}
          {isDevelopment && (
            <Stack.Screen
              name="language-debug"
              options={{ title: "Language Debug" }}
            />
          )}
        </Stack>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}

StyleSheet.create({
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
