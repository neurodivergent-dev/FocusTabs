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
  updateDailyCompletionStats as dbUpdateDailyCompletionStats,
  getGoalsByDate as dbGetGoalsByDate,
  resetAndRecalculateAllCompletionStats as dbResetAndRecalculateAllCompletionStats
} from '../lib/database';
import { aiService } from '../services/aiService';

interface DailyGoalsStore extends GoalsState {
  lastDeletedGoal: Goal | null;
  completionData: DailyCompletion[];
  calendarLoading: boolean;
  calendarError: string | null;
  dateGoals: Goal[];
  dateGoalsLoading: boolean;
  activeTimerGoalId: string | null;
  timerInterval: NodeJS.Timeout | null;

  fetchGoals: () => Promise<void>;
  addGoal: (goalInput: GoalInput) => Promise<boolean>;
  toggleGoalCompletion: (id: string, completed: boolean) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  updateGoalText: (id: string, text: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  clearGoals: () => Promise<void>;
  startGoalTimer: (id: string, duration?: number) => void;
  stopGoalTimer: (id?: string, finalTime?: number) => Promise<void>;
  resetGoalTimer: (id: string) => Promise<void>;
  incrementGoalTime: (id: string) => void;
  saveGoalTime: (id: string) => Promise<void>;
  decomposeGoal: (id: string, language: string) => Promise<boolean>;
  toggleSubTask: (goalId: string, subTaskId: string) => Promise<void>;
  deleteSubTask: (goalId: string, subTaskId: string) => Promise<void>;
  updateSubTask: (goalId: string, subTaskId: string, text: string) => Promise<void>;
  fetchAllCompletions: () => Promise<void>;
  fetchCompletionsForRange: (startDate: Date, endDate: Date) => Promise<void>;
  updateDailyStats: () => Promise<void>;
  fetchGoalsByDate: (date: string) => Promise<void>;
  resetAndRecalculateAllStats: () => Promise<void>;
  hasReachedMaxGoals: (date?: string) => boolean;
  getCompletedGoalsCount: (date?: string) => number;
  getActiveGoalsCount: (date?: string) => number;
  getCompletionPercentageForDate: (date: string) => number;
  cleanupDuplicateGoals: () => Promise<void>;
}

export const useDailyGoalsStore = create<DailyGoalsStore>((set, get) => ({
  goals: [],
  loading: false,
  error: null,
  lastDeletedGoal: null,
  activeTimerGoalId: null,
  timerInterval: null,
  completionData: [],
  calendarLoading: false,
  calendarError: null,
  dateGoals: [],
  dateGoalsLoading: false,

  fetchGoals: async () => {
    set({ loading: true });
    try {
      const goals = await dbGetGoals();
      set({ goals, loading: false });
    } catch (error) {
      set({ error: 'Fetch error', loading: false });
    }
  },

  addGoal: async (goalInput: GoalInput) => {
    if (get().hasReachedMaxGoals()) return false;
    set({ loading: true });
    try {
      const newGoal = await dbAddGoal(goalInput);
      set((state) => ({ goals: [newGoal, ...state.goals], loading: false }));
      get().fetchAllCompletions();
      return true;
    } catch (error) {
      set({ loading: false });
      return false;
    }
  },

  toggleGoalCompletion: async (id: string, completed: boolean) => {
    try {
      await dbUpdateGoal(id, { completed });
      set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, completed } : g),
        dateGoals: state.dateGoals.map((g) => g.id === id ? { ...g, completed } : g)
      }));
      get().fetchAllCompletions();
    } catch (error) { }
  },

  updateGoal: async (id: string, updates: Partial<Goal>) => {
    try {
      await dbUpdateGoal(id, updates);
      set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g),
        dateGoals: state.dateGoals.map((g) => g.id === id ? { ...g, ...updates } : g)
      }));
      // If completed was updated, refresh stats
      if (updates.completed !== undefined) {
        get().fetchAllCompletions();
      }
    } catch (error) {
      console.error('Update goal error:', error);
    }
  },

  updateGoalText: async (id: string, text: string) => {
    try {
      await dbUpdateGoal(id, { text });
      set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, text } : g),
        dateGoals: state.dateGoals.map((g) => g.id === id ? { ...g, text } : g)
      }));
    } catch (error) { }
  },

  deleteGoal: async (id: string) => {
    try {
      const goalToDelete = get().goals.find(g => g.id === id) || get().dateGoals.find(g => g.id === id);
      await dbDeleteGoal(id);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        dateGoals: state.dateGoals.filter((g) => g.id !== id),
        lastDeletedGoal: goalToDelete || null
      }));
      get().fetchAllCompletions();
    } catch (error) { }
  },

  undoDelete: async () => {
    const { lastDeletedGoal } = get();
    if (!lastDeletedGoal) return;
    try {
      const restored = await dbAddGoal(lastDeletedGoal);
      set((state) => ({ goals: [restored, ...state.goals], lastDeletedGoal: null }));
      get().fetchAllCompletions();
    } catch (error) { }
  },

  clearGoals: async () => {
    try {
      await dbClearGoals();
      set({ goals: [], completionData: [] });
    } catch (error) { }
  },

  fetchAllCompletions: async () => {
    try {
      const data = await dbGetAllCompletions();
      set({ completionData: data });
    } catch (error) { }
  },

  startGoalTimer: (id: string, duration?: number) => {
    // Clear any existing timer
    const currentInterval = get().timerInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    // Seçilen göreve hedef süreyi (eğer varsa) ekle
    if (duration !== undefined) {
      set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, targetTime: duration, focusTime: 0 } : g)
      }));
    }

    const interval = setInterval(() => {
      get().incrementGoalTime(id);
    }, 1000);

    set({ activeTimerGoalId: id, timerInterval: interval });
  },

  stopGoalTimer: async (id?: string, finalTime?: number) => {
    const targetId = id || get().activeTimerGoalId;

    // Clear the timer immediately
    const currentInterval = get().timerInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    set({ activeTimerGoalId: null, timerInterval: null });

    if (targetId) {
      const goal = get().goals.find(g => g.id === targetId);
      const timeToSave = finalTime !== undefined ? finalTime : (goal?.focusTime || 0);
      try {
        await dbUpdateGoal(targetId, { focusTime: timeToSave });
        set((state) => ({
          goals: state.goals.map((g) => g.id === targetId ? { ...g, focusTime: timeToSave } : g)
        }));
      } catch (error) {
        console.error('Save time error:', error);
      }
    }
  },

  resetGoalTimer: async (id: string) => {
    try {
      await dbUpdateGoal(id, { focusTime: 0 });
      set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, focusTime: 0 } : g)
      }));
    } catch (error) {
      console.error('Reset timer error:', error);
    }
  },

  incrementGoalTime: (id: string) => {
    const goal = get().goals.find(g => g.id === id);
    if (!goal) return;

    const newFocusTime = (goal.focusTime || 0) + 1;
    
    // Geri sayım bitti mi kontrol et
    if (goal.targetTime && newFocusTime >= goal.targetTime) {
      get().stopGoalTimer(id, goal.targetTime);
      return;
    }

    set((state) => ({
      goals: state.goals.map((g) => g.id === id ? { ...g, focusTime: newFocusTime } : g)
    }));
  },

  saveGoalTime: async (id: string) => {
    const goal = get().goals.find(g => g.id === id);
    if (goal) {
      try { await dbUpdateGoal(id, { focusTime: goal.focusTime }); } catch (e) { }
    }
  },

  decomposeGoal: async (id: string, language: string) => {
    const goal = get().goals.find(g => g.id === id);
    if (!goal) return false;
    set({ loading: true });
    try {
      const subStepTexts = await aiService.decomposeGoal(goal.text, language);
      if (!subStepTexts?.length) { set({ loading: false }); return false; }
      const subTasks = subStepTexts.map((text, i) => ({ id: `${id}-sub-${i}`, text, completed: false }));
      await dbUpdateGoal(id, { subTasks });
      set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, subTasks } : g),
        loading: false
      }));
      return true;
    } catch (error) { set({ loading: false }); return false; }
  },

  toggleSubTask: async (goalId: string, subTaskId: string) => {
    const goal = get().goals.find(g => g.id === goalId) || get().dateGoals.find(g => g.id === goalId);
    if (!goal?.subTasks) return;
    const newSubTasks = goal.subTasks.map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st);
    try {
      await dbUpdateGoal(goalId, { subTasks: newSubTasks });
      set((state) => ({
        goals: state.goals.map(g => g.id === goalId ? { ...g, subTasks: newSubTasks } : g),
        dateGoals: state.dateGoals.map(g => g.id === goalId ? { ...g, subTasks: newSubTasks } : g)
      }));
    } catch (error) { }
  },

  deleteSubTask: async (goalId: string, subTaskId: string) => {
    const goal = get().goals.find(g => g.id === goalId) || get().dateGoals.find(g => g.id === goalId);
    if (!goal?.subTasks) return;
    const newSubTasks = goal.subTasks.filter(st => st.id !== subTaskId);
    try {
      await dbUpdateGoal(goalId, { subTasks: newSubTasks });
      set((state) => ({
        goals: state.goals.map(g => g.id === goalId ? { ...g, subTasks: newSubTasks } : g),
        dateGoals: state.dateGoals.map(g => g.id === goalId ? { ...g, subTasks: newSubTasks } : g)
      }));
    } catch (error) { }
  },

  updateSubTask: async (goalId: string, subTaskId: string, text: string) => {
    const goal = get().goals.find(g => g.id === goalId) || get().dateGoals.find(g => g.id === goalId);
    if (!goal?.subTasks) return;
    const newSubTasks = goal.subTasks.map(st => st.id === subTaskId ? { ...st, text } : st);
    try {
      await dbUpdateGoal(goalId, { subTasks: newSubTasks });
      set((state) => ({
        goals: state.goals.map(g => g.id === goalId ? { ...g, subTasks: newSubTasks } : g),
        dateGoals: state.dateGoals.map(g => g.id === goalId ? { ...g, subTasks: newSubTasks } : g)
      }));
    } catch (error) { }
  },

  fetchCompletionsForRange: async (s: Date, e: Date) => {
    try {
      const data = await dbGetCompletionsByDateRange(s, e);
      set({ completionData: data });
    } catch (error) { }
  },

  updateDailyStats: async () => {
    try {
      await dbUpdateDailyCompletionStats();
      get().fetchAllCompletions();
    } catch (error) { }
  },

  hasReachedMaxGoals: (date?: string) => {
    // Check if unlimited goals is enabled in settings
    const { useSettingsStore } = require('./settingsStore');
    if (useSettingsStore.getState().isUnlimitedGoalsEnabled) return false;

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const targetDate = date || today;
    
    // If it's today, check current goals list
    if (targetDate === today) {
      return get().goals.filter(g => g.date === today).length >= 3;
    }
    
    // If it's the selected date on calendar, check dateGoals
    if (get().dateGoals.length > 0 && get().dateGoals[0].date === targetDate) {
      return get().dateGoals.length >= 3;
    }

    return false; // Default
  },

  getCompletedGoalsCount: (date?: string) => {
    const targetDate = date || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    
    if (get().dateGoals.length > 0 && get().dateGoals[0].date === targetDate) {
      return get().dateGoals.filter(g => g.completed).length;
    }
    
    return get().goals.filter(g => g.date === targetDate && g.completed).length;
  },

  getActiveGoalsCount: (date?: string) => {
    const targetDate = date || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    
    if (get().dateGoals.length > 0 && get().dateGoals[0].date === targetDate) {
      return get().dateGoals.filter(g => !g.completed).length;
    }

    return get().goals.filter(g => g.date === targetDate && !g.completed).length;
  },

  getCompletionPercentageForDate: (date: string) => {
    return get().completionData.find(i => i.date === date)?.percentage || 0;
  },

  fetchGoalsByDate: async (date: string) => {
    set({ dateGoalsLoading: true });
    try {
      const goals = await dbGetGoalsByDate(date);
      set({ dateGoals: goals, dateGoalsLoading: false });
    } catch (error) { set({ dateGoalsLoading: false }); }
  },

  resetAndRecalculateAllStats: async () => {
    try {
      await dbResetAndRecalculateAllCompletionStats();
      get().fetchAllCompletions();
    } catch (error) { }
  },

  cleanupDuplicateGoals: async () => {
    set({ loading: true });
    try {
      const all = await dbGetGoals();
      const ids = new Set();
      for (const g of all) {
        if (ids.has(g.id)) { await dbDeleteGoal(g.id); } else { ids.add(g.id); }
      }
      get().fetchGoals();
      get().fetchAllCompletions();
      set({ loading: false });
    } catch (error) { set({ loading: false }); }
  }
}));
