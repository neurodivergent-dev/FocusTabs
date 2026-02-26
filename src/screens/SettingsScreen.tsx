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
  Info,
  Star,
  ChevronRight,
  Shield,
  Sun,
  Smartphone,
  Palette,
  Globe,
  Database,
  Trash2,
} from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useLanguageStore } from "../store/languageStore";
import { useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import LanguageModal from "../components/LanguageModal";

// Logo komponentini içe aktarıyoruz
import FocusTabsLogo from "../../components/LogoComponent";

// Stil tanımlarını doğrudan burada yapıyoruz
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  themeIconContainer: {
    marginBottom: 8,
  },
  themeText: {
    fontSize: 14,
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
  appVersion: {
    fontSize: 14,
    marginTop: 8,
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
          onPress: () => {
            // Clear all goals
            const { clearGoals } = useDailyGoalsStore.getState();
            clearGoals();
            
            // Reset theme to default
            useThemeStore.getState().setThemeId("default");
            useThemeStore.getState().setThemeMode("system");
            
            // Reset language to device language
            useLanguageStore.getState().setLanguage("en");
            
            Alert.alert(
              t("settings.success") || "Başarılı",
              t("settings.resetSuccess") || "Tüm veriler sıfırlandı"
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[
          colors.primary,
          colors.secondary || colors.primary,
          colors.info || colors.primary,
          colors.primary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.7, 1]}
        style={[styles.header, { 
          paddingTop: insets.top + 8
        }]}
      >
        <Text style={[styles.title, { color: "#FFFFFF" }]}>
          {t("settings.title")}
        </Text>
        <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.9)" }]}>
          {t("settings.customizeYourExperience")}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 20 }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.preferences")}
          </Text>

          <LinearGradient
            colors={[colors.primary + '08', colors.secondary + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.themeSectionContainer, { borderWidth: 1, borderColor: colors.primary + '15' }]}
          >
            <Text style={[styles.themeLabel, { color: colors.text }]}>
              {t("settings.theme")}
            </Text>

            <View style={styles.themeOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
                  themeMode === "light" && {
                    backgroundColor: isDarkMode ? "#4A4A4A" : "#EFEFF7",
                    borderWidth: 1,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleThemeChange("light")}
              >
                <View style={styles.themeIconContainer}>
                  <Sun
                    size={24}
                    color={themeMode === "light" ? colors.primary : colors.text}
                  />
                </View>
                <Text
                  style={[
                    styles.themeText,
                    { color: colors.text },
                    themeMode === "light" && {
                      color: colors.primary,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {t("settings.themeOptions.light")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
                  themeMode === "dark" && {
                    backgroundColor: isDarkMode ? "#4A4A4A" : "#EFEFF7",
                    borderWidth: 1,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleThemeChange("dark")}
              >
                <View style={styles.themeIconContainer}>
                  <Moon
                    size={24}
                    color={themeMode === "dark" ? colors.primary : colors.text}
                  />
                </View>
                <Text
                  style={[
                    styles.themeText,
                    { color: colors.text },
                    themeMode === "dark" && {
                      color: colors.primary,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {t("settings.themeOptions.dark")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
                  themeMode === "system" && {
                    backgroundColor: isDarkMode ? "#4A4A4A" : "#EFEFF7",
                    borderWidth: 1,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleThemeChange("system")}
              >
                <View style={styles.themeIconContainer}>
                  <Smartphone
                    size={24}
                    color={
                      themeMode === "system" ? colors.primary : colors.text
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.themeText,
                    { color: colors.text },
                    themeMode === "system" && {
                      color: colors.primary,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {t("settings.themeOptions.system")}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={[colors.primary + '08', colors.secondary + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.settingItem, { borderWidth: 1, borderColor: colors.primary + '15' }]}
            onPress={handleNavigateToThemeSettings}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
              ]}
            >
              <Palette size={20} color="#8B5CF6" />
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
            <ChevronRight size={20} color={colors.subText} />
          </LinearGradient>

          <LinearGradient
            colors={[colors.primary + '08', colors.secondary + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.settingItem, { borderWidth: 1, borderColor: colors.primary + '15' }]}
            onPress={handleOpenLanguageModal}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
              ]}
            >
              <Globe size={20} color="#3B82F6" />
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
            <ChevronRight size={20} color={colors.subText} />
          </LinearGradient>

          <LinearGradient
            colors={[colors.primary + '08', colors.secondary + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.settingItem, { borderWidth: 1, borderColor: colors.primary + '15' }]}
            onPress={handleNavigateToBackupSettings}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
              ]}
            >
              <Database size={20} color="#10B981" />
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
            <ChevronRight size={20} color={colors.subText} />
          </LinearGradient>

          <LinearGradient
            colors={[colors.error + '15', colors.error + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.settingItem, { borderWidth: 1, borderColor: colors.error + '40' }]}
            onPress={handleResetAllData}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
              ]}
            >
              <Trash2 size={20} color={colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.error }]}>
                {t("settings.resetAllData")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.resetAllDataDescription")}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.about")}
          </Text>

          {/* FocusTabs Logo */}
          <View style={styles.logoContainer}>
            <FocusTabsLogo size={100} color={colors.primary} />
            <Text style={[styles.appVersion, { color: colors.subText }]}>
              FocusTabs v1.0.0
            </Text>
          </View>

          <LinearGradient
            colors={[colors.primary + '08', colors.secondary + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.settingItem, { borderWidth: 1, borderColor: colors.primary + '15' }]}
            onPress={handleRateApp}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
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
            <ChevronRight size={20} color={colors.subText} />
          </LinearGradient>

          <LinearGradient
            colors={[colors.primary + '08', colors.secondary + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.settingItem, { borderWidth: 1, borderColor: colors.primary + '15' }]}
            onPress={handleNavigateToAbout}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
              ]}
            >
              <Info size={20} color="#6366F1" />
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
            <ChevronRight size={20} color={colors.subText} />
          </LinearGradient>

          <LinearGradient
            colors={[colors.primary + '08', colors.secondary + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.settingItem, { borderWidth: 1, borderColor: colors.primary + '15' }]}
            onPress={handleNavigateToPrivacyPolicy}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
              ]}
            >
              <Shield size={20} color="#10B981" />
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
            <ChevronRight size={20} color={colors.subText} />
          </LinearGradient>
        </View>
      </ScrollView>

      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
};
