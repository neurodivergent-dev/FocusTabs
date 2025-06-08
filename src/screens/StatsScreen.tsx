import React from "react";
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from "react-native";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { CheckCircle, Circle, Clock } from "lucide-react-native";
import { useTheme } from "../components/ThemeProvider";

export const StatsScreen: React.FC = () => {
  const { goals, getCompletedGoalsCount, getActiveGoalsCount } =
    useDailyGoalsStore();

  // Tema renklerine erişim
  const { colors, isDarkMode } = useTheme();

  const completedCount = getCompletedGoalsCount();
  const activeCount = getActiveGoalsCount();
  const totalGoals = goals.length;
  const completionRate =
    totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;

  // Format time remaining until midnight
  const getTimeUntilMidnight = (): string => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diffMs = midnight.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Today's progress at a glance
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: isDarkMode ? "#1F1F1F" : "#FFFFFF" },
              ]}
            >
              <Clock size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {getTimeUntilMidnight()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>
              Until Reset
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: isDarkMode ? "#1F1F1F" : "#FFFFFF" },
              ]}
            >
              <CheckCircle size={24} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {completedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>
              Completed
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: isDarkMode ? "#1F1F1F" : "#FFFFFF" },
              ]}
            >
              <Circle size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {activeCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>
              Remaining
            </Text>
          </View>
        </View>

        <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            Completion Rate
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: isDarkMode ? "#1F1F1F" : "#FFFFFF" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionRate}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {Math.round(completionRate)}%
            </Text>
          </View>

          <Text style={[styles.progressNote, { color: colors.subText }]}>
            {totalGoals === 0
              ? "No goals set for today yet"
              : completionRate === 100
                ? "All goals completed. Great job!"
                : completionRate > 0
                  ? "Keep going, you're making progress!"
                  : "Start completing your goals for today"}
          </Text>
        </View>

        <View style={[styles.helpCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>
            Focus Tips
          </Text>
          <Text style={[styles.helpText, { color: colors.text }]}>
            • Set only the most important goals for today{"\n"}• Break down
            complex tasks into simpler ones{"\n"}• Complete your hardest goal
            first{"\n"}• Take short breaks between tasks
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
  progressNote: {
    fontSize: 14,
    marginTop: 8,
  },
  helpCard: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
