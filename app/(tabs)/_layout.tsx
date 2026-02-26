import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, BarChart2, Settings, Calendar } from "lucide-react-native";
import { useTheme } from "../../src/components/ThemeProvider";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */

export default function TabLayout() {
  // Tema renklerine erişim
  const { colors, isDarkMode: _isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarInactiveTintColor: colors.subText,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Goals",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
