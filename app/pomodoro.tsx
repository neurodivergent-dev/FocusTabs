import React, { useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { BackgroundEffects } from "../src/components/BackgroundEffects";
import { usePomodoroStore } from "../src/store/pomodoroStore";
import { useDailyGoalsStore } from "../src/store/dailyGoalsStore";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  interpolate,
  Easing
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useThemeStore } from "../src/store/themeStore";

export default function PomodoroScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const triggerSound = useThemeStore(state => state.triggerSound);

  const {
    isActive,
    isPaused,
    mode,
    timeLeft,
    selectedGoalId,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    tick,
    switchMode,
  } = usePomodoroStore();

  const { goals } = useDailyGoalsStore();
  const selectedGoal = useMemo(() => goals.find(g => g.id === selectedGoalId), [goals, selectedGoalId]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerSound('fanfare');
      switchMode();
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft]);

  // Formatting time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress circle animation
  const progressValue = useSharedValue(1);
  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60;

  useEffect(() => {
    progressValue.value = withTiming(timeLeft / totalTime, { duration: 1000, easing: Easing.linear });
  }, [timeLeft]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progressValue.value, [0, 1], [0.5, 1]),
    transform: [{ scale: interpolate(progressValue.value, [0, 1], [1.05, 1]) }]
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isActive) {
      startTimer(selectedGoalId);
    } else if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetTimer();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent />
      <BackgroundEffects />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pomodoro</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Mode Indicator */}
        <View style={[styles.modeBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {mode === 'work' ? (
            <>
              <Zap size={16} color={colors.warning} />
              <Text style={[styles.modeText, { color: colors.text }]}>{t("pomodoro.workMode", "Odaklanma")}</Text>
            </>
          ) : (
            <>
              <Coffee size={16} color={colors.info} />
              <Text style={[styles.modeText, { color: colors.text }]}>{t("pomodoro.breakMode", "Mola")}</Text>
            </>
          )}
        </View>

        {/* Timer Circle */}
        <View style={styles.timerWrapper}>
          <Animated.View style={[styles.timerCircle, { borderColor: mode === 'work' ? colors.primary : colors.info }, animatedCircleStyle]}>
            <Text style={[styles.timeText, { color: colors.text }]}>{formatTime(timeLeft)}</Text>
          </Animated.View>
        </View>

        {/* Goal Selection Info */}
        <View style={styles.goalInfo}>
          <Text style={[styles.focusingOn, { color: colors.subText }]}>
            {mode === 'work' ? t("pomodoro.focusingOn", "Odaklanılan Hedef") : t("pomodoro.readyForBreak", "Mola Zamanı")}
          </Text>
          <Text style={[styles.goalTitle, { color: colors.text }]}>
            {selectedGoal ? selectedGoal.text : t("pomodoro.noGoalSelected", "Genel Odaklanma")}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleReset}>
            <RotateCcw size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: mode === 'work' ? colors.primary : colors.info }]} 
            onPress={handleToggle}
          >
            {(!isActive || isPaused) ? <Play size={32} color="#FFF" fill="#FFF" /> : <Pause size={32} color="#FFF" fill="#FFF" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              switchMode();
            }}
          >
            {mode === 'work' ? <Coffee size={24} color={colors.text} /> : <Zap size={24} color={colors.text} />}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    marginBottom: 40,
  },
  modeText: { fontSize: 14, fontWeight: '600' },
  timerWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  timeText: {
    fontSize: 64,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  goalInfo: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 40,
  },
  focusingOn: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  goalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
