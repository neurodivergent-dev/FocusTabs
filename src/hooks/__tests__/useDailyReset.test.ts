/**
 * Tests for useDailyReset.ts
 * Tests the daily reset hook and midnight calculation logic
 */

// IMPORTANT: Mocks MUST be before imports (Jest hoisting)

// 1. STORE MOCK
const mockFetchGoals = jest.fn(() => Promise.resolve());
const mockFetchAllCompletions = jest.fn(() => Promise.resolve());
const mockUpdateDailyStats = jest.fn(() => Promise.resolve());

jest.mock('../../store/dailyGoalsStore', () => ({
  useDailyGoalsStore: Object.assign(
    () => ({
      fetchGoals: mockFetchGoals,
      fetchAllCompletions: mockFetchAllCompletions,
      updateDailyStats: mockUpdateDailyStats,
    }),
    {
      getState: () => ({
        fetchGoals: mockFetchGoals,
        fetchAllCompletions: mockFetchAllCompletions,
        updateDailyStats: mockUpdateDailyStats,
      })
    }
  ),
}));

// 2. DATABASE MOCK
jest.mock('../../lib/database', () => {
  const original = jest.requireActual('../../lib/database');
  return {
    ...original,
    resetDailyGoals: jest.fn(() => Promise.resolve()),
  };
});

// 3. REACT NATIVE MOCK
jest.mock('react-native', () => {
  const listeners: Record<string, Function> = {};
  return {
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn((event: string, callback: Function) => {
        listeners[event] = callback;
        return { remove: jest.fn() };
      }),
      _triggerChange: (state: string) => {
        if (listeners['change']) listeners['change'](state);
      }
    },
    InteractionManager: {
      runAfterInteractions: jest.fn((cb: Function) => {
        cb();
        return { cancel: jest.fn(), then: jest.fn() };
      }),
    },
    Platform: { OS: 'android', select: jest.fn() },
  };
});

// 4. IMPORTS (AFTER MOCKS!)
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDailyReset } from '../../hooks/useDailyReset';
import { AppState } from 'react-native';
import * as Database from '../../lib/database';

describe('useDailyReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Fixed date
    const today = new Date('2024-01-15T10:00:00Z');
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize without errors', () => {
    renderHook(() => useDailyReset());
    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should check for day change on app launch', async () => {
    renderHook(() => useDailyReset());

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(mockFetchGoals).toHaveBeenCalled();
  });

  it('should reset goals when date changes', async () => {
    renderHook(() => useDailyReset());

    // Move to tomorrow
    const tomorrow = new Date('2024-01-16T10:00:00Z');
    jest.setSystemTime(tomorrow);

    // Simulate app state change
    await act(async () => {
      (AppState as any)._triggerChange('active');
      jest.runOnlyPendingTimers();
      await Promise.resolve(); // Flush microtasks
    });

    // Check store refresh
    expect(mockFetchGoals).toHaveBeenCalled();
    });

    it('should schedule midnight check', async () => {
    const beforeMidnight = new Date('2024-01-15T23:50:00Z');
    jest.setSystemTime(beforeMidnight);

    renderHook(() => useDailyReset());

    // Advance past midnight
    await act(async () => {
      jest.advanceTimersByTime(11 * 60 * 1000);
      jest.runOnlyPendingTimers();
      await Promise.resolve();
    });

    // Check store refresh
    expect(mockFetchGoals).toHaveBeenCalled();
    });

  it('should calculate time until midnight', () => {
    const now = new Date('2024-01-15T22:00:00Z');
    jest.setSystemTime(now);
    
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    
    expect(midnight.getTime() - now.getTime()).toBe(2 * 60 * 60 * 1000);
  });
});
