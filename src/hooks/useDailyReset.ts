import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { clearGoals } from '../lib/database';

/**
 * Hook to reset goals at midnight each day.
 * Checks if the day has changed when app comes to foreground.
 */
export const useDailyReset = (): void => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastCheckDate = useRef<string>(new Date().toDateString());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // When app comes to foreground (inactive -> active)
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const currentDate = new Date().toDateString();
        
        // Check if the day has changed since last check
        if (currentDate !== lastCheckDate.current) {
          console.log('Day changed, resetting goals...');
          try {
            await clearGoals();
            console.log('Goals reset successfully');
          } catch (error) {
            console.error('Failed to reset goals:', error);
          }
          
          // Update the last check date
          lastCheckDate.current = currentDate;
        }
      }
      
      // Update app state
      appState.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Check for day change on initial load
  useEffect(() => {
    const checkInitialDayChange = async () => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastCheckDate.current) {
        console.log('Day changed on app launch, resetting goals...');
        try {
          await clearGoals();
          console.log('Goals reset successfully on app launch');
        } catch (error) {
          console.error('Failed to reset goals on app launch:', error);
        }
        
        // Update the last check date
        lastCheckDate.current = currentDate;
      }
    };
    
    checkInitialDayChange();
  }, []);
}; 