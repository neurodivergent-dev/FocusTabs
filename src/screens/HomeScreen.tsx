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
import { useTheme } from "../components/ThemeProvider";

export const HomeScreen: React.FC = () => {
  // Use our daily reset hook to check for day changes
  useDailyReset();

  // Tema renklerine erişim
  const { colors, isDarkMode } = useTheme();

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
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>FocusTabs</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Your Mind in 3 Steps
        </Text>

        {totalGoals > 0 && (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: colors.subText }]}>
              {completedCount}/{totalGoals} Completed
            </Text>
            <View
              style={[styles.progressBar, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0}%`,
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
