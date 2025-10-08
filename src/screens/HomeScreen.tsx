import React, { useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useDailyReset } from "../hooks/useDailyReset";
import { GoalCard } from "../components/GoalCard";
import { AddGoalForm } from "../components/AddGoalForm";
import { EmptyState } from "../components/EmptyState";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";

export const HomeScreen: React.FC = () => {
  // Use our daily reset hook to check for day changes
  useDailyReset();

  // Theme colors
  const { colors, isDarkMode } = useTheme();

  // Translation hook
  const { t } = useTranslation();

  // Get goals and actions from our store
  const {
    goals,
    fetchGoals,
    addGoal,
    toggleGoalCompletion,
    updateGoalText,
    deleteGoal,
    hasReachedMaxGoals,
    getCompletedGoalsCount,
  } = useDailyGoalsStore();

  // Fetch goals on component mount and whenever dependencies change
  useEffect(() => {
    // console.log("HomeScreen: Fetching goals...");
    fetchGoals();

    // Add interval to refresh goals every 2 seconds (for debugging)
    const interval = setInterval(() => {
      // console.log("HomeScreen: Auto-refreshing goals...");
      fetchGoals();
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchGoals]);

  // Filter goals to show only today's goals (both active and completed)
  const todayGoals = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = goals.filter((goal) => goal.date === today);
    // console.log(
    //   `HomeScreen: Filtered today's goals: ${filtered.length}`,
    //   filtered
    // );
    return filtered;
  }, [goals]);

  // Handle adding a new goal
  const handleAddGoal = (text: string) => {
    // console.log("HomeScreen: Adding new goal:", text);
    addGoal({ text });
  };

  const completedCount = getCompletedGoalsCount();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("app.name")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {t("app.slogan")}
        </Text>

        {todayGoals.length > 0 && (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: colors.subText }]}>
              {completedCount}/{todayGoals.length} {t("home.completed")}
            </Text>
            <View
              style={[styles.progressBar, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${todayGoals.length > 0 ? (completedCount / todayGoals.length) * 100 : 0}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          todayGoals.length === 0 && styles.emptyScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {todayGoals.length === 0 ? (
          <EmptyState />
        ) : (
          todayGoals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={index}
              onToggleComplete={toggleGoalCompletion}
              onUpdateText={updateGoalText}
              onDelete={deleteGoal}
            />
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <AddGoalForm
          onAddGoal={handleAddGoal}
          disabled={hasReachedMaxGoals()}
        />
      </View>
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
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
});
