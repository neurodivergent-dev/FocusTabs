import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Target, Sparkles } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

export const EmptyState: React.FC = () => {
  // Tema renklerine erişim
  const { colors, isDarkMode } = useTheme();

  // Translation hook
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        {/* Decorative background circles */}
        <View style={[styles.bgCircle, { backgroundColor: colors.primary, opacity: 0.05, width: 200, height: 200, top: -20 }]} />
        <View style={[styles.bgCircle, { backgroundColor: colors.secondary || colors.primary, opacity: 0.05, width: 160, height: 160, bottom: -10 }]} />

        {/* Main Icon with Gradient */}
        <LinearGradient
          colors={[
            colors.primary,
            colors.secondary || colors.primary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Target size={48} color="#FFFFFF" strokeWidth={1.5} />
          
          <View style={styles.sparkleContainer}>
            <Sparkles size={20} color="#FFFFFF" opacity={0.8} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("home.emptyState.title")}
        </Text>
        <Text style={[styles.description, { color: colors.subText }]}>
          {t("home.emptyState.description")}
        </Text>
      </View>

      <View style={[styles.hintContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <Text 
          style={[styles.hintText, { color: colors.primary, opacity: 0.7 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {t("home.startCompleting", "Aşağıdaki butonu kullanarak hedefinizi ekleyin")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    minHeight: 450,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 100,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 24,
    opacity: 0.8,
  },
  hintContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 20,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  hintText: {
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "italic",
    textAlign: "center",
    flexShrink: 1,
  },
});
