import { create } from 'zustand';
import { Goal, GoalInput, GoalsState, DailyCompletion } from '../types/goal';
import { 
  addGoal as dbAddGoal, 
  getGoals as dbGetGoals, 
  updateGoal as dbUpdateGoal, 
  deleteGoal as dbDeleteGoal,
  clearGoals as dbClearGoals,
  getAllCompletions as dbGetAllCompletions,
  getCompletionsByDateRange as dbGetCompletionsByDateRange,
  updateDailyCompletionStats as dbUpdateDailyCompletionStats
} from '../lib/database';

interface DailyGoalsStore extends GoalsState {
  // Calendar/tracking state
  completionData: DailyCompletion[];
  calendarLoading: boolean;
  calendarError: string | null;

  // Actions
  fetchGoals: () => Promise<void>;
  addGoal: (goalInput: GoalInput) => Promise<void>;
  toggleGoalCompletion: (id: string, completed: boolean) => Promise<void>;
  updateGoalText: (id: string, text: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  clearGoals: () => Promise<void>;
  
  // Calendar functions
  fetchAllCompletions: () => Promise<void>;
  fetchCompletionsForRange: (startDate: Date, endDate: Date) => Promise<void>;
  updateDailyStats: () => Promise<void>;
  
  // Getters
  hasReachedMaxGoals: () => boolean;
  getCompletedGoalsCount: () => number;
  getActiveGoalsCount: () => number;
  getCompletionPercentageForDate: (date: string) => number;
}

/**
 * Daily Goals Store
 * Manages the state and actions for the daily goals feature.
 * Limited to 3 goals maximum as per the product requirements.
 */
export const useDailyGoalsStore = create<DailyGoalsStore>((set, get) => ({
  goals: [],
  loading: false,
  error: null,
  
  // Calendar/tracking state
  completionData: [],
  calendarLoading: false,
  calendarError: null,
  
  // Fetch all goals from the database
  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await dbGetGoals();
      set({ goals, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch goals', 
        loading: false 
      });
    }
  },
  
  // Add a new goal
  addGoal: async (goalInput: GoalInput) => {
    // Check if we've reached the maximum of 3 goals
    if (get().hasReachedMaxGoals()) {
      set({ error: 'Maximum of 3 goals reached' });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const newGoal = await dbAddGoal(goalInput);
      set((state) => ({ 
        goals: [newGoal, ...state.goals],
        loading: false
      }));
      
      // Fetch updated completion data
      get().fetchAllCompletions();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add goal', 
        loading: false 
      });
    }
  },
  
  // Toggle a goal's completion status
  toggleGoalCompletion: async (id: string, completed: boolean) => {
    set({ loading: true, error: null });
    try {
      await dbUpdateGoal(id, { completed });
      set((state) => ({
        goals: state.goals.map((goal) => 
          goal.id === id ? { ...goal, completed, updatedAt: new Date() } : goal
        ),
        loading: false
      }));
      
      // Fetch updated completion data
      get().fetchAllCompletions();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update goal', 
        loading: false 
      });
    }
  },
  
  // Update a goal's text
  updateGoalText: async (id: string, text: string) => {
    set({ loading: true, error: null });
    try {
      await dbUpdateGoal(id, { text });
      set((state) => ({
        goals: state.goals.map((goal) => 
          goal.id === id ? { ...goal, text, updatedAt: new Date() } : goal
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update goal', 
        loading: false 
      });
    }
  },
  
  // Delete a goal
  deleteGoal: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await dbDeleteGoal(id);
      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== id),
        loading: false
      }));
      
      // Fetch updated completion data
      get().fetchAllCompletions();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete goal', 
        loading: false 
      });
    }
  },
  
  // Clear all goals
  clearGoals: async () => {
    set({ loading: true, error: null });
    try {
      await dbClearGoals();
      set({ goals: [], loading: false });
      
      // Fetch updated completion data
      get().fetchAllCompletions();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to clear goals', 
        loading: false 
      });
    }
  },
  
  // Fetch all completion data
  fetchAllCompletions: async () => {
    set({ calendarLoading: true, calendarError: null });
    try {
      const completionData = await dbGetAllCompletions();
      set({ completionData, calendarLoading: false });
    } catch (error) {
      set({
        calendarError: error instanceof Error ? error.message : 'Failed to fetch completion data',
        calendarLoading: false
      });
    }
  },
  
  // Fetch completion data for a date range
  fetchCompletionsForRange: async (startDate: Date, endDate: Date) => {
    set({ calendarLoading: true, calendarError: null });
    try {
      const completionData = await dbGetCompletionsByDateRange(startDate, endDate);
      set({ completionData, calendarLoading: false });
    } catch (error) {
      set({
        calendarError: error instanceof Error ? error.message : 'Failed to fetch completion data',
        calendarLoading: false
      });
    }
  },
  
  // Update daily statistics
  updateDailyStats: async () => {
    try {
      await dbUpdateDailyCompletionStats();
      // Fetch updated completion data
      get().fetchAllCompletions();
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  },
  
  // Check if we've reached the maximum of 3 goals
  hasReachedMaxGoals: () => {
    return get().goals.length >= 3;
  },
  
  // Get the number of completed goals
  getCompletedGoalsCount: () => {
    return get().goals.filter((goal) => goal.completed).length;
  },
  
  // Get the number of active (uncompleted) goals
  getActiveGoalsCount: () => {
    return get().goals.filter((goal) => !goal.completed).length;
  },
  
  // Get completion percentage for a specific date
  getCompletionPercentageForDate: (date: string) => {
    const completionRecord = get().completionData.find(item => item.date === date);
    return completionRecord ? completionRecord.percentage : 0;
  }
})); 