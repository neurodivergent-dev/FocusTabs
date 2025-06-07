import React from "react";
import { PrivacyPolicyScreen } from "../src/screens/PrivacyPolicyScreen";
import { Stack } from "expo-router";

/**
 * Privacy Policy screen - displays the app's privacy policy
 */
export default function PrivacyPolicyRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PrivacyPolicyScreen />
    </>
  );
}
