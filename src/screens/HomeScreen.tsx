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
import Animated, { 
  FadeInDown, 
  FadeOut, 
  LinearTransition, 
  useDerivedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor 
} from "react-native-reanimated";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useDailyReset } from "../hooks/useDailyReset";
import { GoalCard } from "../components/GoalCard";
import { AddGoalForm } from "../components/AddGoalForm";
import { EmptyState } from "../components/EmptyState";
import { Celebration } from "../components/Celebration";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { GoalCategory } from "../types/goal";

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
    if (filtered.length > 0) {
      console.log('Today goals:', filtered);
    } else {
      console.log('NO GOALS FOUND! Check date formats!');
      console.log('Sample goal dates:', goals.slice(0, 3).map(g => g.date));
    }
    return filtered;
  }, [goals]);

  // Handle adding a new goal
  const handleAddGoal = (text: string, category: GoalCategory) => {
    // console.log("HomeScreen: Adding new goal:", text, category);
    addGoal({ text, category });
  };

  const completedCount = getCompletedGoalsCount();

  // Smart Progress Animations
  const progressPercent = todayGoals.length > 0 ? (completedCount / todayGoals.length) * 100 : 0;
  
  const progress = useDerivedValue(() => {
    return withSpring(progressPercent, { damping: 15, stiffness: 100 });
  });

  const animatedProgressStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 50, 100],
      ["#F59E0B", "#6366F1", "#10B981"] // Orange -> Indigo -> Emerald
    );

    return {
      width: `${progress.value}%`,
      backgroundColor,
    };
  });

  const gradientColors: [string, string, string, string] = [
    colors.primary || "#6366F1",
    colors.secondary || colors.primary || "#EC4899",
    colors.info || colors.primary || "#3B82F6",
    colors.primary || "#6366F1",
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, {
          paddingTop: insets.top + 12
        }]}
      >
        {/* Decorative background elements */}
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />

        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.title, { color: "#FFFFFF" }]}>
              {t("app.name")}
            </Text>
            <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>
              {t("app.slogan")}
            </Text>
          </View>
        </View>

        {todayGoals.length > 0 && (
          <View style={[
            styles.progressCard,
            { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)' }
          ]}>
            <View style={styles.progressHeader}>
              <Text 
                style={[styles.progressLabel, { color: '#FFFFFF' }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {t("home.dailyProgress", "Günlük İlerleme")}
              </Text>
              <Text style={[styles.progressCount, { color: '#FFFFFF' }]}>
                {completedCount}/{todayGoals.length}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  animatedProgressStyle,
                ]}
              />
            </View>
          </View>
        )}
      </LinearGradient>

      <Celebration visible={todayGoals.length === 3 && completedCount === 3} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVisible ? 0 : 0}
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
              <Animated.View 
                key={goal.id}
                entering={FadeInDown.delay(index * 100).springify().damping(15)}
                exiting={FadeOut.duration(200)}
                layout={LinearTransition.springify().damping(15)}
              >
                <GoalCard
                  goal={goal}
                  index={index}
                  onToggleComplete={toggleGoalCompletion}
                  onUpdateText={updateGoalText}
                  onDelete={deleteGoal}
                />
              </Animated.View>
            ))
          )}
        </ScrollView>

        <View style={[styles.footer, {
          borderTopColor: colors.border,
          paddingVertical: 20, // Üst ve alt boşluğu eşitledim
          justifyContent: 'center', // Dikeyde tam orta
        }]}>
          <AddGoalForm
            onAddGoal={handleAddGoal}
            disabled={hasReachedMaxGoals()}
            currentCount={todayGoals.length}
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
    paddingHorizontal: 20,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerDecorationCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
  },
  progressCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
    flexShrink: 1,
    marginRight: 8,
  },
  progressCount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
