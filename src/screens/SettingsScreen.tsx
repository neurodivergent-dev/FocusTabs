import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Moon,
  Layout,
  Star,
  ChevronRight,
  Lock,
  Sun,
  Smartphone,
  Paintbrush,
  Languages,
  CloudUpload,
  Trash2,
  Heart,
} from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useLanguageStore } from "../store/languageStore";
import { useOnboardingStore } from "../store/onboardingStore";
import { useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import LanguageModal from "../components/LanguageModal";
import Constants from "expo-constants";

// Logo komponentini içe aktarıyoruz
import FocusTabsLogo from "../../components/LogoComponent";

// Stil tanımlarını doğrudan burada yapıyoruz
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerDecorationCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 0,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  // Theme selector styles
  themeSectionContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  themeOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modernThemeCard: {
    width: '31%', // Eşit genişlik sağladım
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modernThemeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Tema renkleri stilleri
  themeColorContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  themeColorOption: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
    padding: 4,
  },
  themeColorSelected: {
    borderWidth: 2,
  },
  themeColorText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    marginTop: 8,
  },
  versionText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeStore();
  const { t } = useTranslation();
  const systemColorScheme = useColorScheme();
  const { colors, isDarkMode } = useTheme();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Update isDarkMode based on system preference when using system theme
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      // Only update the isDarkMode value, don't change the theme mode
      useThemeStore.getState().setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode]);

  const handleRateApp = () => {
    // Open Play Store link for FocusTabs
    const playStoreUrl =
      "https://play.google.com/store/apps/details?id=com.melihcandemir.focustabs";
    Linking.canOpenURL(playStoreUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(playStoreUrl);
        } else {
          Alert.alert(
            "Error",
            "Could not open the Play Store. Please rate us manually."
          );
        }
      })
      .catch((err) => {
        console.error("An error occurred", err);
        Alert.alert(
          "Error",
          "Could not open the Play Store. Please rate us manually."
        );
      });
  };

  const handleNavigateToAbout = () => {
    router.push("/about");
  };

  const handleNavigateToPrivacyPolicy = () => {
    router.push("/privacy-policy");
  };

  // Theme selection handler
  const handleThemeChange = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    if (mode !== "system") {
      useThemeStore.getState().setIsDarkMode(mode === "dark");
    } else if (systemColorScheme) {
      useThemeStore.getState().setIsDarkMode(systemColorScheme === "dark");
    }
  };

  // Theme handling
  const handleNavigateToThemeSettings = () => {
    router.push("/theme-settings");
  };

  // Language handling
  const handleOpenLanguageModal = () => {
    setLanguageModalVisible(true);
  };

  // Backup handling
  const handleNavigateToBackupSettings = () => {
    router.push("/backup-settings");
  };

  // Reset all data
  const handleResetAllData = () => {
    Alert.alert(
      t("settings.resetConfirmTitle") || "Tüm Verileri Sıfırla",
      t("settings.resetConfirmMessage") || "Bu işlem tüm verilerinizi silecek. Devam et?",
      [
        {
          text: t("common.cancel") || "İptal",
          style: "cancel",
        },
        {
          text: t("settings.reset") || "Sıfırla",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all goals and completion data from database
              const { clearGoals } = useDailyGoalsStore.getState();
              await clearGoals();
              
              // Reset onboarding state
              useOnboardingStore.getState().resetState();
              
              // Reset theme to default
              useThemeStore.getState().setThemeId("default");
              useThemeStore.getState().setThemeMode("system");
              
              // Reset language to device language
              useLanguageStore.getState().resetState();
              
              // Redirect to onboarding for a fresh start immediately
              router.replace("/onboarding");
            } catch (error) {
              console.error("Reset data error:", error);
              Alert.alert("Hata", "Veriler sıfırlanırken bir hata oluştu.");
            }
          },
        },
      ]
    );
  };

  const gradientColors: [string, string, string, string] = [
    colors.primary || "#6366F1",
    colors.secondary || colors.primary || "#EC4899",
    colors.info || colors.primary || "#3B82F6",
    colors.primary || "#6366F1",
  ];

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0.0, 0.3, 0.7, 1.0]}
        style={[styles.header, { 
          paddingTop: insets.top + 12
        }]}
      >
        {/* Decorative background elements */}
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />

        <Text style={[styles.title, { color: "#FFFFFF" }]}>
          {t("settings.title")}
        </Text>
        <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>
          {t("settings.customizeYourExperience")}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 125 }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.preferences")}
          </Text>

          <View
            style={[
              styles.themeSectionContainer,
              { 
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.primary + '15',
              },
            ]}
          >
            <Text style={[styles.themeLabel, { color: colors.text }]}>
              {t("settings.theme")}
            </Text>

                        <View style={styles.themeOptionsContainer}>
                          <TouchableOpacity
                            style={[
                              styles.modernThemeCard,
                              { backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" },
                              themeMode === "light" && {
                                backgroundColor: colors.primary + '15',
                                borderColor: colors.primary,
                                borderWidth: 1.5,
                              },
                            ]}
                            onPress={() => handleThemeChange("light")}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.themeIconCircle, themeMode === "light" && { backgroundColor: colors.primary }]}>
                              <Sun size={20} color={themeMode === "light" ? "#FFFFFF" : colors.subText} />
                            </View>
                            <Text
                              style={[
                                styles.modernThemeText,
                                { color: colors.text },
                                themeMode === "light" && { color: colors.primary, fontWeight: "700" },
                              ]}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                            >
                              {t("settings.themeOptions.light")}
                            </Text>
                          </TouchableOpacity>
            
                          <TouchableOpacity
                            style={[
                              styles.modernThemeCard,
                              { backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" },
                              themeMode === "dark" && {
                                backgroundColor: colors.primary + '15',
                                borderColor: colors.primary,
                                borderWidth: 1.5,
                              },
                            ]}
                            onPress={() => handleThemeChange("dark")}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.themeIconCircle, themeMode === "dark" && { backgroundColor: colors.primary }]}>
                              <Moon size={20} color={themeMode === "dark" ? "#FFFFFF" : colors.subText} />
                            </View>
                            <Text
                              style={[
                                styles.modernThemeText,
                                { color: colors.text },
                                themeMode === "dark" && { color: colors.primary, fontWeight: "700" },
                              ]}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                            >
                              {t("settings.themeOptions.dark")}
                            </Text>
                          </TouchableOpacity>
            
                          <TouchableOpacity
                            style={[
                              styles.modernThemeCard,
                              { backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" },
                              themeMode === "system" && {
                                backgroundColor: colors.primary + '15',
                                borderColor: colors.primary,
                                borderWidth: 1.5,
                              },
                            ]}
                            onPress={() => handleThemeChange("system")}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.themeIconCircle, themeMode === "system" && { backgroundColor: colors.primary }]}>
                              <Smartphone size={20} color={themeMode === "system" ? "#FFFFFF" : colors.subText} />
                            </View>
                            <Text
                              style={[
                                styles.modernThemeText,
                                { color: colors.text },
                                themeMode === "system" && { color: colors.primary, fontWeight: "700" },
                              ]}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                            >
                              {t("settings.themeOptions.system")}
                            </Text>
                          </TouchableOpacity>
                        </View>
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={handleNavigateToThemeSettings}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: "#A855F7" + '15' },
              ]}
            >
              <Paintbrush size={20} color="#A855F7" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("settings.theme")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.customizeYourExperience")}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.subText} opacity={0.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={handleOpenLanguageModal}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: "#3B82F6" + '15' },
              ]}
            >
              <Languages size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("settings.language")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.languageDescription")}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.subText} opacity={0.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={handleNavigateToBackupSettings}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: "#10B981" + '15' },
              ]}
            >
              <CloudUpload size={20} color="#10B981" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("settings.backup")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.backupDescription")}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.subText} opacity={0.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: "#EF4444" }]}
            onPress={handleResetAllData}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: "#EF4444" + '15' },
              ]}
            >
              <Trash2 size={20} color="#EF4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: "#EF4444" }]}>
                {t("settings.resetAllData")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.resetAllDataDescription")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.about")}
          </Text>

          {/* FocusTabs Logo */}
          <View style={styles.logoContainer}>
            <FocusTabsLogo size={100} color={colors.primary} />
            <View style={styles.versionBadge}>
              <Text style={[styles.versionText, { color: colors.primary }]}>
                FocusTabs v{Constants.expoConfig?.version || Constants.manifest2?.extra?.expoClient?.version || "1.0.0"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={handleRateApp}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: "#F59E0B" + '15' },
              ]}
            >
              <Star size={20} color="#F59E0B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("settings.rateApp")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.supportUsWithARating")}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.subText} opacity={0.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={handleNavigateToAbout}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: "#6366F1" + '15' },
              ]}
            >
              <Layout size={20} color="#6366F1" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("settings.about")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.versionAndAppInformation")}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.subText} opacity={0.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={handleNavigateToPrivacyPolicy}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: "#10B981" + '15' },
              ]}
            >
              <Lock size={20} color="#10B981" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("settings.privacyPolicy")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.howWeHandleYourData")}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.subText} opacity={0.5} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
};
