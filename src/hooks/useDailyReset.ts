import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, InteractionManager } from 'react-native';
import { resetDailyGoals } from '../lib/database';
import { useDailyGoalsStore } from '../store/dailyGoalsStore';

/**
 * Hook to reset goals at midnight each day.
 * 1. Checks on app launch (after interactions)
 * 2. Checks when app returns from background
 * 3. Actively listens for midnight while the app is open (Live Refresh)
 */
export const useDailyReset = (): void => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastCheckDate = useRef<string>(new Date().toDateString());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { fetchGoals, fetchAllCompletions, updateDailyStats } = useDailyGoalsStore();

  // Use a ref for performReset to avoid circular dependencies in callbacks
  const performResetRef = useRef<(source: string) => Promise<void>>();

  const scheduleMidnightCheck = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const timeToMidnight = midnight.getTime() - now.getTime();
    
    // Schedule a refresh exactly at midnight + 1 second buffer
    timerRef.current = setTimeout(() => {
      if (performResetRef.current) {
        performResetRef.current('Live Midnight Timer');
      }
    }, timeToMidnight + 1000);
  }, []);

  const performReset = useCallback(async (source: string) => {
    const currentDate = new Date().toDateString();
    if (currentDate !== lastCheckDate.current) {
      console.log(`[DAILY RESET] Day changed (${source}), performing reset...`);
      try {
        await resetDailyGoals();
        // Refresh store data to reflect the reset in UI
        await fetchGoals();
        await fetchAllCompletions();
        await updateDailyStats();
        
        lastCheckDate.current = currentDate;
        console.log('[DAILY RESET] Goals reset and UI refreshed successfully');
      } catch (error) {
        console.error('[DAILY RESET] Failed to reset goals:', error);
      }
    }
    // Always schedule the next check if we are live
    scheduleMidnightCheck();
  }, [fetchGoals, fetchAllCompletions, updateDailyStats, scheduleMidnightCheck]);

  // Sync the ref with the latest performReset function
  useEffect(() => {
    performResetRef.current = performReset;
  }, [performReset]);

  // AppState and Lifecycle controls
  useEffect(() => {
    // Wait until initial interactions (navigation, animations) are finished
    const task = InteractionManager.runAfterInteractions(() => {
      // 1. Initial Launch Check (Safe)
      performReset('App Launch');
      
      // 2. Start Live Midnight Tracking
      scheduleMidnightCheck();
    });

    // 3. App State Listener (Background to Foreground)
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        performReset('AppState Change');
      }
      appState.current = nextAppState;
    });
    
    return () => {
      task.cancel();
      subscription.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [performReset, scheduleMidnightCheck]); 
};
