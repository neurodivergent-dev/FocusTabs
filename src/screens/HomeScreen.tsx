import React, { useEffect, useMemo, useState, useRef } from "react";
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
  TouchableOpacity,
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
  interpolateColor,
  SlideOutDown,
} from "react-native-reanimated";
import { RotateCcw } from "lucide-react-native";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useDailyReset } from "../hooks/useDailyReset";
import { useAIStore } from "../store/aiStore";
import { GoalCard } from "../components/GoalCard";
import { AddGoalForm } from "../components/AddGoalForm";
import { EmptyState } from "../components/EmptyState";
import { Celebration } from "../components/Celebration";
import { BackgroundEffects } from "../components/BackgroundEffects";
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
  const { t, i18n } = useTranslation();

  // AI Store
  const { isAIEnabled } = useAIStore();

  // Keyboard state
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Get goals and actions from our store
  const {
    goals,
    fetchGoals,
    addGoal,
    toggleGoalCompletion,
    updateGoalText,
    deleteGoal,
    undoDelete,
    hasReachedMaxGoals,
    getCompletedGoalsCount,
    loading,
    startGoalTimer,
    stopGoalTimer,
    incrementGoalTime,
    activeTimerGoalId,
    decomposeGoal,
    toggleSubTask,
  } = useDailyGoalsStore();

  // Fetch goals on component mount and when goals change
  useEffect(() => {
    console.log('HomeScreen: Fetching goals...');
    fetchGoals();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [fetchGoals]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimerGoalId) {
      interval = setInterval(() => {
        incrementGoalTime(activeTimerGoalId);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerGoalId, incrementGoalTime]);

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

  const [isCelebrationVisible, setIsCelebrationVisible] = useState(false);
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  const prevCompletedCountRef = useRef(completedCount);
  const lastLoadingRef = useRef(loading);
  const isInitialLoadRef = useRef(true);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    
    // Show undo toast
    setIsUndoVisible(true);
    
    // Clear existing timer
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    
    // Auto hide after 5 seconds
    undoTimerRef.current = setTimeout(() => {
      setIsUndoVisible(false);
    }, 5000);
  };

  const handleUndo = async () => {
    await undoDelete();
    setIsUndoVisible(false);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  };

  // Trigger celebration only when reaching 3/3 by ticking (not on load)
  useEffect(() => {
    // If we just finished loading the first time, sync the ref and don't trigger celebration
    if (lastLoadingRef.current === true && loading === false) {
      if (isInitialLoadRef.current) {
        prevCompletedCountRef.current = completedCount;
        isInitialLoadRef.current = false;
      }
    }
    lastLoadingRef.current = loading;

    // Skip logic if still loading
    if (loading) return;

    // Trigger only if completedCount increased and reached 3
    if (todayGoals.length === 3 && completedCount === 3 && prevCompletedCountRef.current < 3) {
      // Small delay to let the last checkbox animation finish
      const timer = setTimeout(() => setIsCelebrationVisible(true), 500);
      return () => clearTimeout(timer);
    } else if (completedCount < 3) {
      setIsCelebrationVisible(false);
    }
    
    // Update ref for next change
    prevCompletedCountRef.current = completedCount;
  }, [completedCount, todayGoals.length, loading]);

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
                {t("home.dailyProgress")}
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
                  onToggleComplete={toggleGoalCompletion}
                  onUpdateText={updateGoalText}
                  onDelete={handleDeleteGoal}
                  onStartTimer={startGoalTimer}
                  onStopTimer={stopGoalTimer}
                  onDecompose={(id) => decomposeGoal(id, i18n.language)}
                  onToggleSubTask={toggleSubTask}
                  isActiveTimer={activeTimerGoalId === goal.id}
                  isAIEnabled={isAIEnabled}
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
            existingGoals={todayGoals.map(g => g.text)}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Undo Toast */}
      {isUndoVisible && (
        <Animated.View 
          entering={FadeInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(300)}
          style={[styles.undoToast, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}
        >
          <View style={styles.undoContent}>
            <Text style={[styles.undoText, { color: colors.text }]}>
              {t("common.goalDeleted", "Hedef silindi")}
            </Text>
            <TouchableOpacity 
              style={[styles.undoButton, { backgroundColor: colors.primary + '20' }]} 
              onPress={handleUndo}
            >
              <RotateCcw size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.undoButtonText, { color: colors.primary }]}>
                {t("common.undo", "Geri Al")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Celebration 
        visible={isCelebrationVisible} 
        goals={todayGoals.map(g => g.text)} 
      />
      <BackgroundEffects />
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
  undoToast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  undoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  undoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  undoButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
