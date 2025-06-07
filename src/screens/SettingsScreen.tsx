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
} from "lucide-react-native";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useThemeStore } from "../store/themeStore";
import { useRouter } from "expo-router";

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { clearGoals } = useDailyGoalsStore();
  const { isDarkMode, toggleTheme, themeMode, setThemeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Update isDarkMode based on system preference when using system theme
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      // Only update the isDarkMode value, don't change the theme mode
      useThemeStore.getState().setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode]);

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

  // Get dynamic styles based on the current theme
  const styles = getStyles(isDarkMode);

  // Get the chevron color based on the theme
  const chevronColor = isDarkMode ? "#FFFFFF40" : "#00000040";

  // Theme selection handler
  const handleThemeChange = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    if (mode !== "system") {
      useThemeStore.getState().setIsDarkMode(mode === "dark");
    } else if (systemColorScheme) {
      useThemeStore.getState().setIsDarkMode(systemColorScheme === "dark");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.themeSectionContainer}>
            <Text style={styles.themeLabel}>Theme Mode</Text>

            <View style={styles.themeOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === "light" && styles.themeOptionSelected,
                ]}
                onPress={() => handleThemeChange("light")}
              >
                <View style={styles.themeIconContainer}>
                  <Sun
                    size={24}
                    color={
                      themeMode === "light"
                        ? "#6366F1"
                        : isDarkMode
                          ? "#FFFFFF"
                          : "#000000"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.themeText,
                    themeMode === "light" && styles.themeTextSelected,
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === "dark" && styles.themeOptionSelected,
                ]}
                onPress={() => handleThemeChange("dark")}
              >
                <View style={styles.themeIconContainer}>
                  <Moon
                    size={24}
                    color={
                      themeMode === "dark"
                        ? "#6366F1"
                        : isDarkMode
                          ? "#FFFFFF"
                          : "#000000"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.themeText,
                    themeMode === "dark" && styles.themeTextSelected,
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === "system" && styles.themeOptionSelected,
                ]}
                onPress={() => handleThemeChange("system")}
              >
                <View style={styles.themeIconContainer}>
                  <Smartphone
                    size={24}
                    color={
                      themeMode === "system"
                        ? "#6366F1"
                        : isDarkMode
                          ? "#FFFFFF"
                          : "#000000"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.themeText,
                    themeMode === "system" && styles.themeTextSelected,
                  ]}
                >
                  System
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color="#EC4899" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Reminders</Text>
              <Text style={styles.settingDescription}>
                Coming in the next update
              </Text>
            </View>
            <Switch disabled={true} value={false} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleResetGoals}
          >
            <View style={styles.settingIconContainer}>
              <RefreshCw size={20} color="#F59E0B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Reset All Goals</Text>
              <Text style={styles.settingDescription}>
                Clear all your current goals
              </Text>
            </View>
            <ChevronRight size={20} color={chevronColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleRateApp}>
            <View style={styles.settingIconContainer}>
              <Star size={20} color="#F59E0B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Rate FocusTabs</Text>
              <Text style={styles.settingDescription}>
                Support us with a rating
              </Text>
            </View>
            <ChevronRight size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleNavigateToAbout}
          >
            <View style={styles.settingIconContainer}>
              <Info size={20} color="#6366F1" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>About</Text>
              <Text style={styles.settingDescription}>
                Version and app information
              </Text>
            </View>
            <ChevronRight size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleNavigateToPrivacyPolicy}
          >
            <View style={styles.settingIconContainer}>
              <Shield size={20} color="#10B981" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.settingDescription}>
                How we handle your data
              </Text>
            </View>
            <ChevronRight size={20} color={chevronColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#121212" : "#FFFFFF",
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#2A2A2A" : "#F5F5F7",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#FFFFFF80" : "#00000080",
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
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 16,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#2A2A2A" : "#F5F5F7",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    settingIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#3A3A3A" : "#FFFFFF",
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
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: isDark ? "#FFFFFF80" : "#00000080",
    },
    // Theme selector styles
    themeSectionContainer: {
      backgroundColor: isDark ? "#2A2A2A" : "#F5F5F7",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    themeLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 16,
    },
    themeOptionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    themeOption: {
      flex: 1,
      alignItems: "center",
      backgroundColor: isDark ? "#3A3A3A" : "#FFFFFF",
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    themeOptionSelected: {
      backgroundColor: isDark ? "#4A4A4A" : "#EFEFF7",
      borderWidth: 1,
      borderColor: "#6366F1",
    },
    themeIconContainer: {
      marginBottom: 8,
    },
    themeText: {
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#000000",
    },
    themeTextSelected: {
      color: "#6366F1",
      fontWeight: "600",
    },
  });
