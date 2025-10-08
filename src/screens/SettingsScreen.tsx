import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  useColorScheme,
  Linking,
} from "react-native";
import {
  Moon,
  Bell,
  Info,
  Star,
  ChevronRight,
  Shield,
  Sun,
  Smartphone,
  Palette,
  Globe,
  Bug,
} from "lucide-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeStore } from "../store/themeStore";
import { useUserStore } from "../store/userStore";
import { useRouter } from "expo-router";
import NotificationService from "../services/NotificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import LanguageModal from "../components/LanguageModal";

// Reminder ayarları için bir key
const REMINDER_ENABLED_KEY = "reminders_enabled";

// Check if in development mode
const isDevelopment = __DEV__;

// Logo komponentini içe aktarıyoruz
import FocusTabsLogo from "../../components/LogoComponent";

// Stil tanımlarını doğrudan burada yapıyoruz
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeStore();
  const { t } = useTranslation();
  const systemColorScheme = useColorScheme();
  const { colors, isDarkMode } = useTheme();
  const { logout, isLoggedIn, isGuest } = useUserStore();

  // Hatırlatıcı durumu için state
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const reminderEnabled =
          await AsyncStorage.getItem(REMINDER_ENABLED_KEY);
        setRemindersEnabled(reminderEnabled === "true");
        setIsLoading(false);
      } catch (error) {
        console.error("Ayarlar yüklenirken hata oluştu:", error);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update isDarkMode based on system preference when using system theme
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      // Only update the isDarkMode value, don't change the theme mode
      useThemeStore.getState().setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode]);

  // Hatırlatıcı ayarlarını değiştirme işlevi
  const toggleReminders = async (value: boolean) => {
    try {
      setRemindersEnabled(value);
      await AsyncStorage.setItem(REMINDER_ENABLED_KEY, value.toString());

      if (value) {
        // Bildirim izinleri iste
        const hasPermission = await NotificationService.requestPermissions();

        if (hasPermission) {
          // Günlük hatırlatıcı kur (akşam 8)
          await NotificationService.scheduleDailyReminder(
            "Günlük Hedeflerinizi Kontrol Edin",
            "Bugünkü hedeflerinizi tamamladınız mı?",
            20, // Saat (24 saat formatında)
            0, // Dakika
            { screen: "index" } // Bildirime tıklandığında hangi ekrana gidileceği
          );

          Alert.alert(
            "Hatırlatıcılar Açıldı",
            "Her gün akşam 8'de günlük hedeflerinizi kontrol etmeniz için size bildirim göndereceğiz."
          );
        } else {
          // İzin verilmediğinde hatırlatıcıları kapatın
          setRemindersEnabled(false);
          await AsyncStorage.setItem(REMINDER_ENABLED_KEY, "false");

          Alert.alert(
            "Bildirim İzni Gerekli",
            "Hatırlatıcıları kullanabilmek için bildirim izinlerini etkinleştirmeniz gerekiyor.",
            [{ text: "Tamam" }]
          );
        }
      } else {
        // Tüm bildirimleri iptal et
        await NotificationService.cancelAllNotifications();
        Alert.alert(
          "Hatırlatıcılar Kapatıldı",
          "Artık bildirim almayacaksınız."
        );
      }
    } catch (error) {
      console.error("Hatırlatıcı ayarları kaydedilirken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Hatırlatıcı ayarları kaydedilirken bir hata oluştu."
      );
    }
  };

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

  // Navigate to language debug screen
  const handleNavigateToLanguageDebug = () => {
    router.push("/language-debug");
  };

  const handleLogout = () => {
    Alert.alert(
      t("auth.login.title"),
      t("auth.logout.confirmMessage") || "Are you sure you want to log out?",
      [
        {
          text: t("auth.logout.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("auth.logout.confirm") || "Log Out",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleNavigateToLogin = () => {
    // Misafir kullanıcı özelliğini geçici olarak kaldır
    if (isGuest) {
      // isGuest durumunu geçici olarak false yap, böylece layout otomatik yönlendirme yapmaz
      useUserStore.setState({ isGuest: false });

      // Login sayfasına yönlendir
      router.replace("/login");

      // 100ms sonra isGuest'i tekrar true yap (UI güncellendikten sonra)
      setTimeout(() => {
        useUserStore.setState({ isGuest: true });
      }, 100);
    } else {
      // Normal durumda direkt login'e yönlendir
      router.replace("/login");
    }
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("settings.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {t("settings.customizeYourExperience")}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.preferences")}
          </Text>

          <View
            style={[
              styles.themeSectionContainer,
              { backgroundColor: colors.card },
            ]}
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
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
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
          </TouchableOpacity>

          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
              ]}
            >
              <Bell size={20} color="#EC4899" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("settings.notifications")}
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                {t("settings.notificationsDescription")}
              </Text>
            </View>
            <Switch
              disabled={isLoading}
              value={remindersEnabled}
              onValueChange={toggleReminders}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={remindersEnabled ? "#FFFFFF" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.data")}
          </Text>

          {/* Add language debug option only in development mode */}
          {isDevelopment && (
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: colors.card }]}
              onPress={handleNavigateToLanguageDebug}
            >
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
                ]}
              >
                <Bug size={20} color="#EF4444" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t("settings.language")} Debug
                </Text>
                <Text
                  style={[styles.settingDescription, { color: colors.subText }]}
                >
                  {t("settings.language")}{" "}
                  {t("settings.howWeHandleYourData").toLowerCase()}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.subText} />
            </TouchableOpacity>
          )}

          {/* Login button - only visible when not logged in */}
          {!isLoggedIn && (
            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                  borderWidth: 1,
                },
              ]}
              onPress={handleNavigateToLogin}
            >
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
                ]}
              >
                <MaterialIcons name="login" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  {t("settings.welcomeBack", "Welcome Back")}
                </Text>
                <Text
                  style={[styles.settingDescription, { color: colors.subText }]}
                >
                  {isGuest
                    ? t("auth.guest.switchToAccount") ||
                      "Switch to full account"
                    : t("auth.login.subtitle") || "Sign in to your account"}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.primary} />
            </TouchableOpacity>
          )}

          {/* Logout button - only visible when logged in */}
          {isLoggedIn && (
            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.error,
                  borderWidth: 1,
                },
              ]}
              onPress={handleLogout}
            >
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
                ]}
              >
                <MaterialIcons name="logout" size={20} color={colors.error} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>
                  {t("auth.logout.title") || "Logout"}
                </Text>
                <Text
                  style={[styles.settingDescription, { color: colors.subText }]}
                >
                  {t("auth.logout.description") || "Sign out of your account"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
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
