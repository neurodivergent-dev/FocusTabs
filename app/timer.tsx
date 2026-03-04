import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { useDailyGoalsStore } from '../src/store/dailyGoalsStore';
import { useAIStore } from '../src/store/aiStore';
import { GoalCard } from '../src/components/GoalCard';
import { GlassContainer } from '../src/components/GlassContainer';
import { useTheme } from '../src/components/ThemeProvider';
import { soundService } from '../src/services/SoundService';
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

  const activeGoal = useMemo(() => {
    return goals.find(g => g.id === activeTimerGoalId);
  }, [goals, activeTimerGoalId]);

  // Navigate back if there's no active timer
  useEffect(() => {
    if (!activeTimerGoalId) {
      router.back();
    }
  }, [activeTimerGoalId]);

  const handleClose = () => {
    stopGoalTimer();
    soundService.playTimer();
    // Navigation back is handled by the useEffect
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
            onDelete={() => {}} // Delete not allowed in focus mode? 
            onStartTimer={() => {}} // Already started
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
