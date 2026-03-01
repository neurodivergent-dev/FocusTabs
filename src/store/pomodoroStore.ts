import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PomodoroState {
  isActive: boolean;
  isPaused: boolean;
  mode: 'work' | 'break';
  timeLeft: number; // saniye cinsinden
  selectedGoalId: string | null;
  totalFocusTimeToday: number; // İstatistikler için
  
  // Actions
  startTimer: (goalId: string | null) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  switchMode: () => void;
  addFocusTime: (seconds: number) => void;
}

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      isActive: false,
      isPaused: false,
      mode: 'work',
      timeLeft: WORK_TIME,
      selectedGoalId: null,
      totalFocusTimeToday: 0,

      startTimer: (goalId) => set({ 
        isActive: true, 
        isPaused: false, 
        selectedGoalId: goalId,
        timeLeft: get().mode === 'work' ? WORK_TIME : BREAK_TIME 
      }),

      pauseTimer: () => set({ isPaused: true }),
      
      resumeTimer: () => set({ isPaused: false }),

      resetTimer: () => set({ 
        isActive: false, 
        isPaused: false, 
        timeLeft: get().mode === 'work' ? WORK_TIME : BREAK_TIME 
      }),

      tick: () => {
        const { timeLeft, isActive, isPaused, mode } = get();
        if (isActive && !isPaused && timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
          if (mode === 'work') {
            set({ totalFocusTimeToday: get().totalFocusTimeToday + 1 });
          }
        }
      },

      switchMode: () => {
        const newMode = get().mode === 'work' ? 'break' : 'work';
        set({ 
          mode: newMode, 
          timeLeft: newMode === 'work' ? WORK_TIME : BREAK_TIME,
          isActive: false,
          isPaused: false
        });
      },

      addFocusTime: (seconds) => set({ 
        totalFocusTimeToday: get().totalFocusTimeToday + seconds 
      }),
    }),
    {
      name: 'pomodoro-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
