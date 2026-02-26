import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

  // Safe area insets
  const insets = useSafeAreaInsets();

  // Theme colors
  const { colors, isDarkMode } = useTheme();

  // Translation hook
  const { t } = useTranslation();

  // Keyboard state
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  // Fetch goals on component mount and when goals change
  useEffect(() => {
    console.log('HomeScreen: Fetching goals...');
    fetchGoals();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [fetchGoals]);

  // Filter goals to show only today's goals (both active and completed)
  const todayGoals = useMemo(() => {
    // Use local time to get today's date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    const filtered = goals.filter((goal) => {
      // Normalize both dates for comparison
      const goalDate = goal.date.split("T")[0];
      return goalDate === today;
    });
    console.log('=== HOME SCREEN DEBUG ===');
    console.log('Today:', today);
    console.log('All goals count:', goals.length);
    console.log('Today goals count:', filtered.length);
    if (filtered.length > 0) {
      console.log('Today goals:', filtered);
    } else {
      console.log('NO GOALS FOUND! Check date formats!');
      console.log('Sample goal dates:', goals.slice(0, 3).map(g => g.date));
    }
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

      <LinearGradient
        colors={[
          colors.primary,
          colors.secondary || colors.primary,
          colors.info || colors.primary,
          colors.primary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.7, 1]}
        style={[styles.header, {
          paddingTop: insets.top + 8
        }]}
      >
        <Text style={[styles.title, { color: "#FFFFFF" }]}>
          {t("app.name")}
        </Text>
        <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.9)" }]}>
          {t("app.slogan")}
        </Text>

        {todayGoals.length > 0 && (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: "rgba(255, 255, 255, 0.8)" }]}>
              {completedCount}/{todayGoals.length} {t("home.completed")}
            </Text>
            <View
              style={[styles.progressBar, { backgroundColor: "rgba(255, 255, 255, 0.3)" }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${todayGoals.length > 0 ? (completedCount / todayGoals.length) * 100 : 0}%`,
                    backgroundColor: "#FFFFFF",
                  },
                ]}
              />
            </View>
          </View>
        )}
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVisible ? -20 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            todayGoals.length === 0 && styles.emptyScrollContent,
            { paddingBottom: 20 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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

        <View style={[styles.footer, {
          borderTopColor: colors.border,
          paddingBottom: 16
        }]}>
          <AddGoalForm
            onAddGoal={handleAddGoal}
            disabled={hasReachedMaxGoals()}
            currentCount={goals.length}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    borderTopWidth: 1,
  },
});
