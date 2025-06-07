import React from "react";
import { AboutScreen } from "../src/screens/AboutScreen";
import { Stack } from "expo-router";

/**
 * About screen - displays detailed information about the app
 */
export default function AboutRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AboutScreen />
    </>
  );
}
