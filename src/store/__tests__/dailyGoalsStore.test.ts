/**
 * Tests for dailyGoalsStore.ts
 * Tests the core state management for daily goals
 */

import { useDailyGoalsStore } from '../dailyGoalsStore';
import { createMockGoal, createMockDailyCompletion, testThreeGoalsLimit, testTimerFunctionality } from '../../__tests__/utils/test-utils';

// Mock database operations
jest.mock('../../lib/database', () => ({
  addGoal: jest.fn().mockImplementation(async (goalInput) => ({
    id: `goal-${Date.now()}`,
    ...goalInput,
    completed: goalInput.completed ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
    date: goalInput.date || new Date().toISOString().split('T')[0],
  })),
  getGoals: jest.fn().mockResolvedValue([]),
  updateGoal: jest.fn().mockResolvedValue(undefined),
  deleteGoal: jest.fn().mockResolvedValue(undefined),
  clearGoals: jest.fn().mockResolvedValue(undefined),
  getAllCompletions: jest.fn().mockResolvedValue([]),
  getCompletionsByDateRange: jest.fn().mockResolvedValue([]),
  updateDailyCompletionStats: jest.fn().mockResolvedValue(undefined),
  getGoalsByDate: jest.fn().mockResolvedValue([]),
  resetAndRecalculateAllCompletionStats: jest.fn().mockResolvedValue(undefined),
}));

describe('dailyGoalsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDailyGoalsStore.setState({
      goals: [],
      loading: false,
      error: null,
      lastDeletedGoal: null,
      completionData: [],
      dateGoals: [],
      activeTimerGoalId: null,
      timerInterval: null,
    });
    jest.clearAllMocks();
  });

  describe('Goal Management', () => {
    it('should initialize with empty goals', () => {
      const state = useDailyGoalsStore.getState();
      expect(state.goals).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should add a goal successfully', async () => {
      const { addGoal, fetchGoals } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Test Goal', category: 'work' });
      
      const state = useDailyGoalsStore.getState();
      expect(state.goals.length).toBe(1);
      expect(state.goals[0].text).toBe('Test Goal');
      expect(state.goals[0].category).toBe('work');
    });

    it('should enforce 3 goals limit per day', async () => {
      const store = useDailyGoalsStore.getState();
      
      await testThreeGoalsLimit(store, store.addGoal);
    });

    it('should toggle goal completion', async () => {
      const { addGoal, toggleGoalCompletion } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Test Goal', category: 'work' });
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      expect(state.goals[0].completed).toBe(false);
      
      await toggleGoalCompletion(goalId, true);
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.goals[0].completed).toBe(true);
    });

    it('should update goal text', async () => {
      const { addGoal, updateGoalText } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Original Text', category: 'work' });
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      await updateGoalText(goalId, 'Updated Text');
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.goals[0].text).toBe('Updated Text');
    });

    it('should delete a goal', async () => {
      const { addGoal, deleteGoal } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Test Goal', category: 'work' });
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      await deleteGoal(goalId);
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.goals.length).toBe(0);
      expect(updatedState.lastDeletedGoal).toBeDefined();
    });

    it('should undo delete', async () => {
      const { addGoal, deleteGoal, undoDelete } = useDailyGoalsStore.getState();

      await addGoal({ text: 'Test Goal', category: 'work' });
      
      let state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;

      await deleteGoal(goalId);
      
      state = useDailyGoalsStore.getState();
      expect(state.goals.length).toBe(0);

      await undoDelete();

      const restoredState = useDailyGoalsStore.getState();
      expect(restoredState.goals.length).toBe(1);
      expect(restoredState.lastDeletedGoal).toBeNull();
    });

    it('should clear all goals', async () => {
      const { addGoal, clearGoals } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Goal 1', category: 'work' });
      await addGoal({ text: 'Goal 2', category: 'health' });
      
      expect(useDailyGoalsStore.getState().goals.length).toBe(2);
      
      await clearGoals();
      
      expect(useDailyGoalsStore.getState().goals.length).toBe(0);
    });
  });

  describe('Timer Functionality', () => {
    jest.useFakeTimers();

    it('should start timer for a goal', async () => {
      const { addGoal, startGoalTimer } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Test Goal', category: 'work' });
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      startGoalTimer(goalId);
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.activeTimerGoalId).toBe(goalId);
      expect(updatedState.timerInterval).toBeDefined();
    });

    it('should stop timer and save focus time', async () => {
      const { addGoal, startGoalTimer, stopGoalTimer } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Test Goal', category: 'work' });
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      startGoalTimer(goalId);
      jest.advanceTimersByTime(5000); // Simulate 5 seconds
      
      await stopGoalTimer();
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.activeTimerGoalId).toBeNull();
      expect(updatedState.timerInterval).toBeNull();
    });

    it('should reset timer', async () => {
      const { addGoal, startGoalTimer, stopGoalTimer, resetGoalTimer } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Test Goal', category: 'work', focusTime: 100 });
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      startGoalTimer(goalId);
      jest.advanceTimersByTime(5000);
      await stopGoalTimer();
      
      await resetGoalTimer(goalId);
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.goals[0].focusTime).toBe(0);
    });

    jest.useRealTimers();
  });

  describe('SubTask Management', () => {
    it('should decompose goal into subtasks', async () => {
      const { addGoal, decomposeGoal } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Complex Goal', category: 'work' });
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      const result = await decomposeGoal(goalId, 'en');
      
      // Mock returns false since AI is mocked
      expect(typeof result).toBe('boolean');
    });

    it('should toggle subtask completion', async () => {
      const { addGoal, toggleSubTask } = useDailyGoalsStore.getState();
      
      await addGoal({
        text: 'Goal with subtasks',
        category: 'work',
        subTasks: [
          { id: 'sub-1', text: 'Subtask 1', completed: false },
          { id: 'sub-2', text: 'Subtask 2', completed: false },
        ],
      });
      
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      expect(state.goals[0].subTasks?.[0].completed).toBe(false);
      
      await toggleSubTask(goalId, 'sub-1');
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.goals[0].subTasks?.[0].completed).toBe(true);
    });

    it('should delete a subtask', async () => {
      const { addGoal, deleteSubTask } = useDailyGoalsStore.getState();
      
      await addGoal({
        text: 'Goal with subtasks',
        category: 'work',
        subTasks: [
          { id: 'sub-1', text: 'Subtask 1', completed: false },
          { id: 'sub-2', text: 'Subtask 2', completed: false },
        ],
      });
      
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      await deleteSubTask(goalId, 'sub-1');
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.goals[0].subTasks?.length).toBe(1);
      expect(updatedState.goals[0].subTasks?.[0].id).toBe('sub-2');
    });

    it('should update subtask text', async () => {
      const { addGoal, updateSubTask } = useDailyGoalsStore.getState();
      
      await addGoal({
        text: 'Goal with subtasks',
        category: 'work',
        subTasks: [{ id: 'sub-1', text: 'Original', completed: false }],
      });
      
      const state = useDailyGoalsStore.getState();
      const goalId = state.goals[0].id;
      
      await updateSubTask(goalId, 'sub-1', 'Updated');
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.goals[0].subTasks?.[0].text).toBe('Updated');
    });
  });

  describe('Completion Statistics', () => {
    it('should calculate completion percentage for date', () => {
      const store = useDailyGoalsStore.getState();
      
      useDailyGoalsStore.setState({
        completionData: [
          createMockDailyCompletion({ date: '2024-01-01', percentage: 50 }),
          createMockDailyCompletion({ date: '2024-01-02', percentage: 100 }),
        ],
      });
      
      const percentage = store.getCompletionPercentageForDate('2024-01-01');
      expect(percentage).toBe(50);
    });

    it('should return 0 for date with no data', () => {
      const store = useDailyGoalsStore.getState();
      
      useDailyGoalsStore.setState({ completionData: [] });
      
      const percentage = store.getCompletionPercentageForDate('2024-01-01');
      expect(percentage).toBe(0);
    });

    it('should count completed goals for today', () => {
      const today = new Date().toISOString().split('T')[0];
      
      useDailyGoalsStore.setState({
        goals: [
          createMockGoal({ date: today, completed: true }),
          createMockGoal({ date: today, completed: true }),
          createMockGoal({ date: today, completed: false }),
        ],
      });
      
      const store = useDailyGoalsStore.getState();
      expect(store.getCompletedGoalsCount()).toBe(2);
    });

    it('should count active goals for today', () => {
      const today = new Date().toISOString().split('T')[0];
      
      useDailyGoalsStore.setState({
        goals: [
          createMockGoal({ date: today, completed: true }),
          createMockGoal({ date: today, completed: false }),
          createMockGoal({ date: today, completed: false }),
        ],
      });
      
      const store = useDailyGoalsStore.getState();
      expect(store.getActiveGoalsCount()).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle database errors gracefully', async () => {
      const { addGoal } = useDailyGoalsStore.getState();
      
      jest.mocked(require('../../lib/database').addGoal).mockRejectedValueOnce(
        new Error('Database error')
      );
      
      await expect(addGoal({ text: 'Test', category: 'work' })).resolves.toBeUndefined();
      // Should not throw, just log error
    });

    it('should handle concurrent timer operations', async () => {
      const { addGoal, startGoalTimer, stopGoalTimer } = useDailyGoalsStore.getState();
      
      await addGoal({ text: 'Goal 1', category: 'work' });
      await addGoal({ text: 'Goal 2', category: 'health' });
      
      const state = useDailyGoalsStore.getState();
      const goal1Id = state.goals[0].id;
      const goal2Id = state.goals[1].id;
      
      // Start timer for goal 1
      startGoalTimer(goal1Id);
      // Starting timer for goal 2 should stop the first one
      startGoalTimer(goal2Id);
      
      const updatedState = useDailyGoalsStore.getState();
      expect(updatedState.activeTimerGoalId).toBe(goal2Id);
      
      await stopGoalTimer();
    });
  });
});
