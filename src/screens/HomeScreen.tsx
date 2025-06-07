import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
} from "react-native";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useDailyReset } from "../hooks/useDailyReset";
import { GoalCard } from "../components/GoalCard";
import { AddGoalForm } from "../components/AddGoalForm";
import { EmptyState } from "../components/EmptyState";
import { useThemeStore } from "../store/themeStore";
import Colors from "../../constants/Colors";

export const HomeScreen: React.FC = () => {
  // Use our daily reset hook to check for day changes
  useDailyReset();

  // Get theme information
  const { themeMode, isDarkMode } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Determine if we should use dark mode
  const useDarkMode =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark") ||
    isDarkMode;

  // Get theme colors
  const themeColors = Colors[useDarkMode ? "dark" : "light"];

  // Get goals and actions from our store
  const {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    toggleGoalCompletion,
    updateGoalText,
    deleteGoal,
    hasReachedMaxGoals,
    getCompletedGoalsCount,
  } = useDailyGoalsStore();

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Handle adding a new goal
  const handleAddGoal = (text: string) => {
    addGoal({ text });
  };

  const completedCount = getCompletedGoalsCount();
  const totalGoals = goals.length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar
        barStyle={useDarkMode ? "light-content" : "dark-content"}
        backgroundColor={themeColors.background}
      />

      <View
        style={[
          styles.header,
          { borderBottomColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
        ]}
      >
        <Text style={[styles.title, { color: themeColors.text }]}>
          FocusTabs
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
          ]}
        >
          Your Mind in 3 Steps
        </Text>

        {totalGoals > 0 && (
          <View style={styles.progressContainer}>
            <Text
              style={[
                styles.progressText,
                { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
              ]}
            >
              {completedCount}/{totalGoals} Completed
            </Text>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0}%`,
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
          goals.length === 0 && styles.emptyScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          <EmptyState />
        ) : (
          goals.map((goal, index) => (
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

      <View
        style={[
          styles.footer,
          { borderTopColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
        ]}
      >
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
