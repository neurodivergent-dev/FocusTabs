import { create } from 'zustand';
import { Goal, GoalInput, GoalsState } from '../types/goal';
import { 
  addGoal as dbAddGoal, 
  getGoals as dbGetGoals, 
  updateGoal as dbUpdateGoal, 
  deleteGoal as dbDeleteGoal,
  clearGoals as dbClearGoals
} from '../lib/database';

interface DailyGoalsStore extends GoalsState {
  // Actions
  fetchGoals: () => Promise<void>;
  addGoal: (goalInput: GoalInput) => Promise<void>;
  toggleGoalCompletion: (id: string, completed: boolean) => Promise<void>;
  updateGoalText: (id: string, text: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  clearGoals: () => Promise<void>;
  
  // Getters
  hasReachedMaxGoals: () => boolean;
  getCompletedGoalsCount: () => number;
  getActiveGoalsCount: () => number;
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
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to clear goals', 
        loading: false 
      });
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
  }
})); 