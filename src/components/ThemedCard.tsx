import React from "react";
import { StyleSheet, View, Text, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "./ThemeProvider";

interface ThemedCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  title,
  description,
  children,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  // useTheme hook ile temaya erişim
  const { colors, isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
          shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
        },
        style,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.title, { color: colors.text }, titleStyle]}>
          {title}
        </Text>

        {description && (
          <Text
            style={[
              styles.description,
              { color: colors.subText },
              descriptionStyle,
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {children && <View style={styles.cardContent}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  cardContent: {
    marginTop: 8,
  },
});

export default ThemedCard;
