export type GoalCategory = 'work' | 'health' | 'personal' | 'finance' | 'other';

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  date: string; // YYYY-MM-DD formatında tarih
  category: GoalCategory;
}

export type GoalInput = Pick<Goal, 'text' | 'category'>;

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
