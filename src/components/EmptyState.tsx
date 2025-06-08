import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { AlignCenter } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";

export const EmptyState: React.FC = () => {
  // Tema renklerine erişim
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
        <AlignCenter size={40} color={colors.subText} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>No Goals Set</Text>
      <Text style={[styles.description, { color: colors.subText }]}>
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
