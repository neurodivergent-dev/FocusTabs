import { StyleSheet } from "react-native";
import { StatsScreen } from "../../src/screens/StatsScreen";

/**
 * Stats tab - displays statistics and progress
 */
export default function StatsTabScreen() {
  return <StatsScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
