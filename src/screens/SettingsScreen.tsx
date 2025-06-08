import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
  useColorScheme,
  Platform,
} from "react-native";
import {
  Moon,
  Bell,
  RefreshCw,
  Info,
  Star,
  ChevronRight,
  Shield,
  Sun,
  Smartphone,
  Palette,
} from "lucide-react-native";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useThemeStore } from "../store/themeStore";
import { useRouter } from "expo-router";
import NotificationService from "../services/NotificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES } from "../constants/themes";
import { useTheme } from "../components/ThemeProvider";

// Reminder ayarları için bir key
const REMINDER_ENABLED_KEY = "reminders_enabled";
const REMINDER_TIME_KEY = "reminders_time";

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
});

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { clearGoals } = useDailyGoalsStore();
  const {
    isDarkMode: storeIsDarkMode,
    toggleTheme,
    themeMode,
    setThemeMode,
  } = useThemeStore();
  const systemColorScheme = useColorScheme();
  const { colors, isDarkMode } = useTheme();

  // Hatırlatıcı durumu için state
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleResetGoals = () => {
    Alert.alert(
      "Reset All Goals",
      "Are you sure you want to clear all goals? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              await clearGoals();
              Alert.alert("Success", "All goals have been reset.");
            } catch (error) {
              Alert.alert("Error", "Failed to reset goals. Please try again.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleRateApp = () => {
    // This would link to the app store in a production app
    Alert.alert("Rate FocusTabs", "This would open the app store rating page.");
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

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Customize your experience
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>

          <View
            style={[
              styles.themeSectionContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.themeLabel, { color: colors.text }]}>
              Theme Mode
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
                  Light
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
                  Dark
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
                  System
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
                Theme Colors
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                Customize app colors and themes
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
                Daily Reminders
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                Get reminded of your goals at 8 PM
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
            Data
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={handleResetGoals}
          >
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
              ]}
            >
              <RefreshCw size={20} color="#F59E0B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Reset All Goals
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                Clear all your current goals
              </Text>
            </View>
            <ChevronRight size={20} color={colors.subText} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>

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
                Rate FocusTabs
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                Support us with a rating
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
                About
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                Version and app information
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
                Privacy Policy
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                How we handle your data
              </Text>
            </View>
            <ChevronRight size={20} color={colors.subText} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
