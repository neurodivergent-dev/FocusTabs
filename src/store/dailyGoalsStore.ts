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
  // Undo state
  lastDeletedGoal: Goal | null;

  // Calendar/tracking state
  completionData: DailyCompletion[];
  calendarLoading: boolean;
  calendarError: string | null;
  dateGoals: Goal[]; // Seçilen tarih için görevler
  dateGoalsLoading: boolean; // Seçilen tarih için görevlerin yükleme durumu

  // Timer state
  activeTimerGoalId: string | null;

  // Actions
  fetchGoals: () => Promise<void>;
  addGoal: (goalInput: GoalInput) => Promise<void>;
  toggleGoalCompletion: (id: string, completed: boolean) => Promise<void>;
  updateGoalText: (id: string, text: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  clearGoals: () => Promise<void>;
  
  // Timer actions
  startGoalTimer: (id: string) => void;
  stopGoalTimer: () => void;
  incrementGoalTime: (id: string) => void;
  saveGoalTime: (id: string) => Promise<void>;
  
  // AI Slicer actions
  decomposeGoal: (id: string, language: string) => Promise<void>;
  toggleSubTask: (goalId: string, subTaskId: string) => Promise<void>;
  
  // Calendar functions
  fetchAllCompletions: () => Promise<void>;
  fetchCompletionsForRange: (startDate: Date, endDate: Date) => Promise<void>;
  updateDailyStats: () => Promise<void>;
  fetchGoalsByDate: (date: string) => Promise<void>; // Belirli bir tarih için görevleri getir
  resetAndRecalculateAllStats: () => Promise<void>; // Tüm tamamlama istatistiklerini sıfırla ve yeniden hesapla
  
  // Getters
  hasReachedMaxGoals: () => boolean;
  getCompletedGoalsCount: () => number;
  getActiveGoalsCount: () => number;
  getCompletionPercentageForDate: (date: string) => number;
  
  // New actions
  cleanupDuplicateGoals: () => Promise<void>;
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
  lastDeletedGoal: null,
  activeTimerGoalId: null,
  
  // Calendar/tracking state
  completionData: [],
  calendarLoading: false,
  calendarError: null,
  dateGoals: [],
  dateGoalsLoading: false,
  
  // Fetch all goals from the database
  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await dbGetGoals();
      
      // Çift kayıtları tespit etmek için ID'leri takip et
      const seenIds = new Set();
      const uniqueGoals = goals.filter(goal => {
        // Daha önce bu ID'yi görmediysen, ekle ve true döndür
        if (!seenIds.has(goal.id)) {
          seenIds.add(goal.id);
          return true;
        }
        // Bu ID daha önce görüldü, false döndür (filtrele)
        console.warn(`Çift kayıt tespit edildi, ID: ${goal.id}`);
        return false;
      });
      
      if (uniqueGoals.length !== goals.length) {
        console.warn(`${goals.length - uniqueGoals.length} adet çift kayıt temizlendi`);
      }
      
      // No filtering - show all goals including completed ones
      // Uncomment the code below if you want to filter completed goals again
      /* 
      const today = new Date().toISOString().split("T")[0];
      const activeGoals = goals.filter(goal => {
        // Keep only today's incomplete goals
        return goal.date !== today || !goal.completed;
      });
      */
      
      set({ goals: uniqueGoals, loading: false });
      
      // Log the loaded goals for debugging
      // console.log(`Loaded ${uniqueGoals.length} goals`);
      
      // For debugging - log today's goals
      const today = new Date().toISOString().split("T")[0];
      const _todayGoals = uniqueGoals.filter(goal => goal.date === today);
      // console.log(`Today's goals: ${_todayGoals.length}`, _todayGoals);
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
      // console.log("dailyGoalsStore: Adding new goal:", goalInput);
      const newGoal = await dbAddGoal(goalInput);
      // console.log("dailyGoalsStore: New goal added:", newGoal);
      
      // Get current goals from state
      const _currentGoals = get().goals;
      // console.log("dailyGoalsStore: Current goals before update:", _currentGoals.length);
      
      // Update state with new goal
      set((state) => ({ 
        goals: [newGoal, ...state.goals],
        loading: false
      }));
      
      // Log after update
      // console.log("dailyGoalsStore: Goals after update:", get().goals.length);
      
      // Fetch updated completion data
      get().fetchAllCompletions();
      
      // Bugünün görevlerini yeniden yükle
      const today = new Date().toISOString().split("T")[0];
      get().fetchGoalsByDate(today);
      
      // Immediately fetch all goals to refresh the list
      get().fetchGoals();
    } catch (error) {
      console.error("dailyGoalsStore: Error adding goal:", error);
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
      
      // Bugünün tarihi için görevleri yeniden yükle
      const today = new Date().toISOString().split("T")[0];
      get().fetchGoalsByDate(today);
      
      // Şu anda görüntülenen tarih bugünden farklıysa ve değiştirilen görev bugüne ait değilse
      // seçili tarihin görevlerini de güncelle
      const selectedDate = get().dateGoals.length > 0 ? get().dateGoals[0].date : today;
      if (selectedDate !== today) {
        get().fetchGoalsByDate(selectedDate);
      }
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
      
      // Takvim verilerini güncelle
      get().updateDailyStats();
      
      // Bugünün tarihi için görevleri yeniden yükle
      const today = new Date().toISOString().split("T")[0];
      get().fetchGoalsByDate(today);
      
      // Şu anda görüntülenen tarih bugünden farklıysa, seçili tarihin görevlerini de güncelle
      const selectedDate = get().dateGoals.length > 0 ? get().dateGoals[0].date : today;
      if (selectedDate !== today) {
        get().fetchGoalsByDate(selectedDate);
      }
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
      // Find the goal before deleting to save it for undo
      const goalToDelete = get().goals.find(g => g.id === id);
      
      await dbDeleteGoal(id);
      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== id),
        lastDeletedGoal: goalToDelete || null,
        loading: false
      }));
      
      // Fetch updated completion data
      get().fetchAllCompletions();
      
      // Bugünün tarihi için görevleri yeniden yükle
      const today = new Date().toISOString().split("T")[0];
      get().fetchGoalsByDate(today);
      
      // Şu anda görüntülenen tarih bugünden farklıysa, seçili tarihin görevlerini de güncelle
      const selectedDate = get().dateGoals.length > 0 ? get().dateGoals[0].date : today;
      if (selectedDate !== today) {
        get().fetchGoalsByDate(selectedDate);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete goal', 
        loading: false 
      });
    }
  },

  // Undo the last deletion
  undoDelete: async () => {
    const { lastDeletedGoal } = get();
    if (!lastDeletedGoal) return;

    set({ loading: true, error: null });
    try {
      // Re-add the goal to database
      const restoredGoal = await dbAddGoal({
        text: lastDeletedGoal.text,
        category: lastDeletedGoal.category,
        date: lastDeletedGoal.date,
        completed: lastDeletedGoal.completed
      });

      set((state) => ({
        goals: [restoredGoal, ...state.goals],
        lastDeletedGoal: null,
        loading: false
      }));

      // Refresh everything
      get().fetchAllCompletions();
      const today = new Date().toISOString().split("T")[0];
      get().fetchGoalsByDate(today);
      get().fetchGoals();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to undo deletion', 
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
      
      // Bugünün görevlerini sıfırla
      set({ dateGoals: [] });
      
      // Takvim verilerini güncelle
      get().updateDailyStats();
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

  // Timer actions
  startGoalTimer: (id: string) => {
    set({ activeTimerGoalId: id });
  },

  stopGoalTimer: () => {
    const { activeTimerGoalId } = get();
    if (activeTimerGoalId) {
      get().saveGoalTime(activeTimerGoalId);
    }
    set({ activeTimerGoalId: null });
  },

  incrementGoalTime: (id: string) => {
    set((state) => ({
      goals: state.goals.map((goal) => 
        goal.id === id ? { ...goal, focusTime: (goal.focusTime || 0) + 1 } : goal
      )
    }));
  },

  saveGoalTime: async (id: string) => {
    const goal = get().goals.find(g => g.id === id);
    if (goal) {
      try {
        await dbUpdateGoal(id, { focusTime: goal.focusTime });
      } catch (error) {
        console.error('Error saving goal focus time:', error);
      }
    }
  },

  // AI Slicer implementation
  decomposeGoal: async (id: string, language: string) => {
    const goal = get().goals.find(g => g.id === id);
    if (!goal) return;

    set({ loading: true });
    try {
      const subStepTexts = await aiService.decomposeGoal(goal.text, language);
      const subTasks = subStepTexts.map((text, index) => ({
        id: `${id}-sub-${index}`,
        text,
        completed: false
      }));

      await dbUpdateGoal(id, { subTasks });
      set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, subTasks } : g),
        loading: false
      }));
    } catch (error) {
      console.error('Error decomposing goal:', error);
      set({ loading: false });
    }
  },

  toggleSubTask: async (goalId: string, subTaskId: string) => {
    const goal = get().goals.find(g => g.id === goalId);
    if (!goal || !goal.subTasks) return;

    const newSubTasks = goal.subTasks.map(st => 
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );

    try {
      await dbUpdateGoal(goalId, { subTasks: newSubTasks });
      set((state) => ({
        goals: state.goals.map(g => g.id === goalId ? { ...g, subTasks: newSubTasks } : g)
      }));
    } catch (error) {
      console.error('Error toggling subtask:', error);
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
    // Bugünün tarihini al (local time kullanarak)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    // Sadece bugünün hedeflerini say
    const todayGoals = get().goals.filter(goal => goal.date === today);
    return todayGoals.length >= 3;
  },
  
  // Get the number of completed goals
  getCompletedGoalsCount: () => {
    // Bugünün tarihini al (local time kullanarak)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    // Sadece bugünün tamamlanmış hedeflerini say
    return get().goals.filter((goal) => goal.date === today && goal.completed).length;
  },
  
  // Get the number of active (uncompleted) goals
  getActiveGoalsCount: () => {
    // Bugünün tarihini al (local time kullanarak)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    // Sadece bugünün tamamlanmamış hedeflerini say
    return get().goals.filter((goal) => goal.date === today && !goal.completed).length;
  },
  
  // Get completion percentage for a specific date
  getCompletionPercentageForDate: (date: string) => {
    const completionRecord = get().completionData.find(item => item.date === date);
    return completionRecord ? completionRecord.percentage : 0;
  },
  
  // Fetch goals for a specific date
  fetchGoalsByDate: async (date: string) => {
    set({ dateGoalsLoading: true, error: null });
    try {
      const goals = await dbGetGoalsByDate(date);
      set({ dateGoals: goals, dateGoalsLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch goals for the date', 
        dateGoalsLoading: false 
      });
    }
  },
  
  // Tüm istatistikleri sıfırla ve yeniden hesapla
  resetAndRecalculateAllStats: async () => {
    set({ calendarLoading: true, calendarError: null });
    try {
      await dbResetAndRecalculateAllCompletionStats();
      
      // Tüm tamamlama verilerini yeniden yükle
      const completionData = await dbGetAllCompletions();
      set({ completionData, calendarLoading: false });
      
      console.log('Tüm tamamlama istatistikleri yeniden hesaplandı ve yüklendi.');
    } catch (error) {
      set({
        calendarError: error instanceof Error ? error.message : 'Failed to recalculate stats',
        calendarLoading: false
      });
      console.error('İstatistikleri yeniden hesaplama hatası:', error);
    }
  },
  
  // Veritabanındaki çift kayıtları temizle
  cleanupDuplicateGoals: async () => {
    set({ loading: true, error: null });
    try {
      console.log("Çift kayıtları temizleme başlatıldı...");
      
      // Tüm görevleri al
      const allGoals = await dbGetGoals();
      
      // ID'lere göre görevleri grupla
      const goalsByIds = {};
      allGoals.forEach(goal => {
        if (!goalsByIds[goal.id]) {
          goalsByIds[goal.id] = [];
        }
        goalsByIds[goal.id].push(goal);
      });
      
      // Çift kayıtları temizle
      let deletedCount = 0;
      for (const id in goalsByIds) {
        if (goalsByIds[id].length > 1) {
          // İlkini tut, diğerlerini sil
          for (let i = 1; i < goalsByIds[id].length; i++) {
            await dbDeleteGoal(id);
            deletedCount++;
          }
        }
      }
      
      console.log(`Toplam ${deletedCount} adet çift kayıt temizlendi`);
      
      // Verileri yeniden yükle
      await get().fetchGoals();
      await get().fetchAllCompletions();
      await get().updateDailyStats();
      
      set({ loading: false });
    } catch (error) {
      console.error("Çift kayıtları temizlerken hata:", error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to cleanup duplicates', 
        loading: false 
      });
    }
  }
})); 