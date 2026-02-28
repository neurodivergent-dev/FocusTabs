import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Target, TrendingUp, Settings2, Calendar } from "lucide-react-native";
import { useTheme } from "../../src/components/ThemeProvider";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 84 + insets.bottom : 100,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          backgroundColor: isDarkMode ? "rgba(25, 25, 30, 0.98)" : "rgba(255, 255, 255, 0.98)",
          borderTopWidth: 1,
          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 12,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.goals", "Goals"),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary + "15" }]}>
              <Target size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("tabs.calendar", "Calendar"),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary + "15" }]}>
              <Calendar size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t("tabs.stats", "Stats"),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary + "15" }]}>
              <TrendingUp size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings", "Settings"),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary + "15" }]}>
              <Settings2 size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 44,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
});
