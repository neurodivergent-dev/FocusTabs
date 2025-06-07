import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Home, BarChart2, Settings } from "lucide-react-native";
import { useThemeStore } from "../../src/store/themeStore";
import Colors from "../../constants/Colors";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: { color: string }) {
  return <Home size={24} color={props.color} />;
}

export default function TabLayout() {
  const systemColorScheme = useColorScheme();
  const { themeMode, isDarkMode } = useThemeStore();

  // Determine if we should use dark mode
  const useDarkMode =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark") ||
    isDarkMode;

  // Use the appropriate color scheme
  const effectiveColorScheme = useDarkMode ? "dark" : "light";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[effectiveColorScheme].tint,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: Colors[effectiveColorScheme].background,
        },
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
