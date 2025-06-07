import { StyleSheet } from "react-native";
import { SettingsScreen } from "../../src/screens/SettingsScreen";

/**
 * Settings tab - displays app settings and information
 */
export default function SettingsTabScreen() {
  return <SettingsScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
