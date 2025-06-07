import React from "react";
import { StyleSheet, View, Text, Image, useColorScheme } from "react-native";
import { AlignCenter } from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";
import Colors from "../../constants/Colors";

export const EmptyState: React.FC = () => {
  // Get theme information
  const { themeMode, isDarkMode } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Determine if we should use dark mode
  const useDarkMode =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark") ||
    isDarkMode;

  // Get theme colors
  const themeColors = Colors[useDarkMode ? "dark" : "light"];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
        ]}
      >
        <AlignCenter
          size={40}
          color={useDarkMode ? "#FFFFFF40" : "#00000040"}
        />
      </View>
      <Text style={[styles.title, { color: themeColors.text }]}>
        No Goals Set
      </Text>
      <Text
        style={[
          styles.description,
          { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
        ]}
      >
        Add up to 3 goals for today to stay focused on what matters most.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 24,
  },
});
