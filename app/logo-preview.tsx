import React from "react";
import { Stack } from "expo-router";
import LogoPreview from "../components/LogoPreview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../src/components/ThemeProvider";

export default function LogoPreviewScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Logo Preview",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <LogoPreview />
    </SafeAreaView>
  );
}
