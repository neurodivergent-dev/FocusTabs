import React from "react";
import BackupSettingsScreen from "../src/screens/BackupSettingsScreen";
import { Stack } from "expo-router";

/**
 * Backup & Restore screen - allows users to export/import their data
 */
export default function BackupSettingsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BackupSettingsScreen />
    </>
  );
}
