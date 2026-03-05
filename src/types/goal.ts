export type GoalCategory = 'work' | 'health' | 'personal' | 'finance' | 'other';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  date: string; // YYYY-MM-DD formatında tarih
  category: GoalCategory;
  focusTime: number; // Odaklanılan toplam saniye
  subTasks?: SubTask[]; // AI tarafından parçalanmış alt görevler
}

export type GoalInput = {
  text: string;
  category: GoalCategory;
  date?: string;
  completed?: boolean;
  focusTime?: number;
};

export interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

export interface DailyCompletion {
  date: string; // YYYY-MM-DD formatında
  completedCount: number;
  totalCount: number;
  percentage: number;
}
