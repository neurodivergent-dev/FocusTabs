export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type GoalInput = Pick<Goal, 'text'>;

export interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
} 