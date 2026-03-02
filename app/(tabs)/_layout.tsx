import React from "react";
import { Tabs } from "expo-router";
import { Home, Calendar, BarChart2, Settings } from "lucide-react-native";
import { useTheme } from "../../src/components/ThemeProvider";
import { soundService } from "../../src/services/SoundService";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const tabListeners = {
    tabPress: () => {
      soundService.playClick();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={tabListeners}
        options={{
          title: t("tabs.goals"),
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        listeners={tabListeners}
        options={{
          title: t("tabs.calendar"),
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        listeners={tabListeners}
        options={{
          title: t("tabs.stats"),
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        listeners={tabListeners}
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
