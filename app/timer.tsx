import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { useDailyGoalsStore } from '../src/store/dailyGoalsStore';
import { useAIStore } from '../src/store/aiStore';
import { GoalCard } from '../src/components/GoalCard';
import { GlassContainer } from '../src/components/GlassContainer';
import { useTheme } from '../src/components/ThemeProvider';
import { soundService } from '../src/services/SoundService';
import notificationService from '../src/services/NotificationService';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

export default function TimerScreen() {
  const { 
    goals, 
    activeTimerGoalId, 
    stopGoalTimer, 
    toggleGoalCompletion,
    updateGoal,
    decomposeGoal,
    toggleSubTask,
    deleteSubTask,
    updateSubTask,
    resetGoalTimer
  } = useDailyGoalsStore();
  
  const { isAIEnabled } = useAIStore();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const lastUpdatedMinuteRef = useRef<number>(-1);
  const notificationIdRef = useRef<string | null>(null);

  const activeGoal = useMemo(() => {
    return goals.find(g => g.id === activeTimerGoalId);
  }, [goals, activeTimerGoalId]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Notification management
  const focusTime = activeGoal?.focusTime || 0;
  const goalText = activeGoal?.text || "";

  useEffect(() => {
    if (!activeTimerGoalId || !goalText) return;

    const updateNotification = async () => {
      await notificationService.sendFocusNotification(
        t("common.focusActive"),
        `${goalText} • ${formatDuration(focusTime)}`,
        true
      );
    };

    updateNotification();
  }, [focusTime, goalText, activeTimerGoalId]);

  // Clean up notification on unmount
  useEffect(() => {
    return () => {
      // Sabit ID ile siliyoruz
      notificationService.cancelNotification('focus-timer');
    };
  }, []);

  // Navigate back if there's no active timer
  useEffect(() => {
    if (!activeTimerGoalId) {
      router.back();
    }
  }, [activeTimerGoalId]);

  const handleClose = () => {
    stopGoalTimer();
    soundService.playTimer();
  };

  if (!activeGoal) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <GlassContainer onClose={handleClose}>
        <Animated.View 
          entering={ZoomIn.duration(400).springify().damping(15)}
          exiting={ZoomOut.duration(200)}
          style={styles.cardContainer}
        >
          <GoalCard
            goal={activeGoal}
            onToggleComplete={toggleGoalCompletion}
            onUpdateGoal={updateGoal}
            onDelete={() => {}} 
            onStartTimer={() => {}} 
            onStopTimer={(id, time) => {
              stopGoalTimer(id, time);
              soundService.playTimer();
            }}
            onResetTimer={resetGoalTimer}
            onDecompose={decomposeGoal}
            onToggleSubTask={toggleSubTask}
            onDeleteSubTask={deleteSubTask}
            onUpdateSubTask={updateSubTask}
            isActiveTimer={true}
            isAIEnabled={isAIEnabled}
            isFocusMode={true}
          />
        </Animated.View>
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 500,
  },
});
