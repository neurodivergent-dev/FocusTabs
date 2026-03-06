/**
 * Test Utilities for FocusTabs
 * Common helper functions for testing
 */

import { act } from '@testing-library/react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Common Mocks for Native Modules
 */
export const setupNativeMocks = () => {
  // Mock AsyncStorage
  jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  }));

  // Mock expo-secure-store
  jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
    isAvailableAsync: jest.fn().mockResolvedValue(true),
  }));

  // Mock expo-sqlite
  jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getAllAsync: jest.fn().mockResolvedValue([]),
      getFirstAsync: jest.fn(),
    })),
  }));

  // Mock expo-notifications
  jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    addNotificationResponseReceivedListener: jest.fn(),
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    scheduleNotificationAsync: jest.fn(),
    cancelAllScheduledNotificationsAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
    AndroidImportance: { MAX: 4, DEFAULT: 3 },
    AndroidNotificationVisibility: { PUBLIC: 1 },
    AndroidNotificationPriority: { MAX: 2 },
  }));
};

/**
 * Wait for a specific amount of time
 */
export const waitForTime = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wait for all pending promises to resolve
 */
export const flushPromises = () => new Promise(setImmediate);

/**
 * Mock Date constructor to return a specific date
 */
export const mockDate = (date: string | Date) => {
  const OriginalDate = global.Date;
  global.Date = jest.fn(() => new OriginalDate(date)) as any;
  global.Date.now = jest.fn(() => new OriginalDate(date).getTime());
  global.Date.parse = jest.fn((str) => OriginalDate.parse(str));
  global.Date.UTC = jest.fn((...args) => OriginalDate.UTC(...args));
  return () => {
    global.Date = OriginalDate;
  };
};

/**
 * Create a mock goal object
 */
export const createMockGoal = (overrides?: Partial<any>) => ({
  id: `goal-${Date.now()}-${Math.random()}`,
  text: 'Test Goal',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  date: new Date().toISOString().split('T')[0],
  category: 'other' as const,
  focusTime: 0,
  subTasks: undefined,
  ...overrides,
});

/**
 * Create a mock daily completion object
 */
export const createMockDailyCompletion = (overrides?: Partial<any>) => ({
  date: new Date().toISOString().split('T')[0],
  completedCount: 0,
  totalCount: 0,
  percentage: 0,
  ...overrides,
});

/**
 * Create a mock chat message object
 */
export const createMockChatMessage = (overrides?: Partial<any>) => ({
  id: `msg-${Date.now()}`,
  text: 'Test message',
  role: 'user' as const,
  timestamp: Date.now(),
  ...overrides,
});

/**
 * Test the 3 goals limit enforcement
 */
export const testThreeGoalsLimit = async (store: any, addGoal: (goal: any) => Promise<void>) => {
  // Add 3 goals
  await addGoal({ text: 'Goal 1', category: 'work' });
  await addGoal({ text: 'Goal 2', category: 'health' });
  await addGoal({ text: 'Goal 3', category: 'personal' });

  // Verify 3 goals limit is enforced
  expect(store.hasReachedMaxGoals()).toBe(true);

  // Try to add a 4th goal (should be rejected)
  const initialCount = store.goals.length;
  await addGoal({ text: 'Goal 4', category: 'other' });

  // Goal count should not change
  expect(store.goals.length).toBe(initialCount);
};

/**
 * Test timer functionality
 */
export const testTimerFunctionality = async (
  store: any,
  goalId: string,
  startTimer: (id: string) => void,
  stopTimer: (id?: string, time?: number) => Promise<void>,
  resetTimer: (id: string) => Promise<void>
) => {
  // Start timer
  startTimer(goalId);
  expect(store.activeTimerGoalId).toBe(goalId);
  expect(store.timerInterval).toBeDefined();

  // Wait for timer to increment
  await act(async () => {
    await waitForTime(1100); // Wait for 1+ second
  });

  // Verify focus time increased
  const goal = store.goals.find((g: any) => g.id === goalId);
  expect(goal.focusTime).toBeGreaterThan(0);

  // Stop timer
  await stopTimer();
  expect(store.activeTimerGoalId).toBeNull();
  expect(store.timerInterval).toBeNull();

  // Reset timer
  await resetTimer(goalId);
  const resetGoal = store.goals.find((g: any) => g.id === goalId);
  expect(resetGoal.focusTime).toBe(0);
};

/**
 * Test streak calculation
 */
export const calculateStreak = (completionData: any[], today: string): number => {
  let streak = 0;
  
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = new Date(today);
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterdayDate);

  const todayData = completionData.find(d => d.date === today);
  const yesterdayData = completionData.find(d => d.date === yesterdayStr);

  const isTodaySuccess = todayData && todayData.totalCount > 0 && todayData.percentage >= 70;
  const isYesterdaySuccess = yesterdayData && yesterdayData.totalCount > 0 && yesterdayData.percentage >= 70;

  if (isTodaySuccess || isYesterdaySuccess) {
    let checkDate = isTodaySuccess ? new Date(today) : yesterdayDate;

    while (true) {
      const checkDateStr = formatDateStr(checkDate);
      const dayEntry = completionData.find(d => d.date === checkDateStr);

      if (dayEntry && dayEntry.totalCount > 0 && dayEntry.percentage >= 70) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return streak;
};

/**
 * Format seconds to H:MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hrs > 0
    ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default {
  waitForTime,
  flushPromises,
  mockDate,
  createMockGoal,
  createMockDailyCompletion,
  createMockChatMessage,
  testThreeGoalsLimit,
  testTimerFunctionality,
  calculateStreak,
  formatDuration,
};
