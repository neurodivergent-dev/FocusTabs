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
  useDerivedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolateColor,
  SlideOutDown,
} from "react-native-reanimated";
import { X as XIcon, RotateCcw } from "lucide-react-native";
import { router } from "expo-router";
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
import { soundService } from "../services/SoundService";

export const HomeScreen: React.FC = () => {
  useDailyReset();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { isAIEnabled } = useAIStore();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const {
    goals,
    fetchGoals,
    addGoal,
    toggleGoalCompletion,
    updateGoal,
    deleteGoal,
    undoDelete,
    hasReachedMaxGoals,
    loading,
    startGoalTimer,
    stopGoalTimer,
    resetGoalTimer,
    activeTimerGoalId,
    decomposeGoal,
    toggleSubTask,
    deleteSubTask,
    updateSubTask,
  } = useDailyGoalsStore();

  useEffect(() => {
    fetchGoals();
    const s1 = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const s2 = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => { s1.remove(); s2.remove(); };
  }, [fetchGoals]);

  // Navigate to timer screen when a timer is active
  useEffect(() => {
    if (activeTimerGoalId) {
      router.push("/timer");
    }
  }, [activeTimerGoalId]);

  const allTodayGoals = useMemo(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return goals.filter((goal) => goal.date.split("T")[0] === today);
  }, [goals]);

  const completedCount = useMemo(() => allTodayGoals.filter(g => g.completed).length, [allTodayGoals]);
  const progressPercent = allTodayGoals.length > 0 ? (completedCount / allTodayGoals.length) * 100 : 0;
  const progress = useDerivedValue(() => withTiming(progressPercent, { duration: 600 }));

  const [isCelebrationVisible, setIsCelebrationVisible] = useState(false);
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  const prevCompletedCountRef = useRef(completedCount);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    setIsUndoVisible(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setIsUndoVisible(false), 5000);
  };

  useEffect(() => {
    if (loading) return;
    if (allTodayGoals.length === 3 && completedCount === 3 && prevCompletedCountRef.current < 3) {
      const timer = setTimeout(() => setIsCelebrationVisible(true), 500);
      return () => clearTimeout(timer);
    } else if (completedCount < 3) {
      setIsCelebrationVisible(false);
    }
    prevCompletedCountRef.current = completedCount;
  }, [completedCount, allTodayGoals.length, loading]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
    backgroundColor: interpolateColor(progress.value, [0, 100], ["rgba(255,255,255,0.7)", "#10B981"]),
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />

        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: "#FFFFFF" }]}>
              {t("app.name")}
            </Text>
            <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>
              {t("app.slogan")}
            </Text>
          </View>
        </View>

        {allTodayGoals.length > 0 && (
          <View style={[styles.progressCard, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)' }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: '#FFFFFF' }]}>{t("home.dailyProgress")}</Text>
              <Text style={[styles.progressCount, { color: '#FFFFFF' }]}>{completedCount}/{allTodayGoals.length}</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
            </View>
          </View>
        )}
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent, 
            allTodayGoals.length === 0 && styles.emptyScrollContent,
            { paddingBottom: keyboardVisible ? 150 : 20 } 
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {allTodayGoals.length === 0 ? (
            <EmptyState />
          ) : (
            allTodayGoals.map((goal, index) => (
              <Animated.View key={goal.id} entering={FadeInDown.delay(index * 100).springify().damping(15)}>
                <GoalCard
                  goal={goal}
                  onToggleComplete={toggleGoalCompletion}
                  onUpdateGoal={updateGoal}
                  onDelete={handleDeleteGoal}
                  onStartTimer={startGoalTimer}
                  onStopTimer={stopGoalTimer}
                  onResetTimer={resetGoalTimer}
                  onDecompose={(id) => decomposeGoal(id, i18n.language)}
                  onToggleSubTask={toggleSubTask}
                  onDeleteSubTask={deleteSubTask}
                  onUpdateSubTask={updateSubTask}
                  isActiveTimer={activeTimerGoalId === goal.id}
                  isAIEnabled={isAIEnabled}
                />
              </Animated.View>
            ))
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopWidth: 0, paddingBottom: 10, paddingTop: 0 }]}>
          <AddGoalForm
            onAddGoal={(text, category) => addGoal({ text, category })}
            disabled={hasReachedMaxGoals()}
            currentCount={allTodayGoals.length}
            existingGoals={allTodayGoals.map(g => g.text)}
          />
        </View>
      </KeyboardAvoidingView>

      {isUndoVisible && (
        <Animated.View entering={FadeInDown} exiting={SlideOutDown} style={[styles.undoToast, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
          <View style={styles.undoContent}>
            <Text style={[styles.undoText, { color: colors.text }]}>{t("common.goalDeleted")}</Text>
            <TouchableOpacity style={[styles.undoButton, { backgroundColor: colors.primary + '20' }]} onPress={async () => { await undoDelete(); setIsUndoVisible(false); }}>
              <RotateCcw size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.undoButtonText, { color: colors.primary }]}>{t("common.undo")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Celebration visible={isCelebrationVisible} goals={allTodayGoals.map(g => g.text)} />
      <BackgroundEffects />
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 28, position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerDecorationCircle1: { position: 'absolute', top: -40, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  headerDecorationCircle2: { position: 'absolute', bottom: -30, left: -40, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: "500", opacity: 0.9 },
  progressCard: { borderRadius: 20, padding: 16, marginTop: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', opacity: 0.9, flexShrink: 1, marginRight: 8 },
  progressCount: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: 'rgba(0, 0, 0, 0.15)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 4 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  emptyScrollContent: { flexGrow: 1 },
  footer: { paddingHorizontal: 16, paddingVertical: 0, borderTopWidth: 0 },
  undoToast: { position: 'absolute', bottom: 100, left: 20, right: 20, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  undoContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  undoText: { fontSize: 14, fontWeight: '600' },
  undoButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  undoButtonText: { fontSize: 14, fontWeight: '800' },
  stopFocusButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
