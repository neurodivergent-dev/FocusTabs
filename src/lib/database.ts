import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import { Goal, GoalInput } from '../types/goal';

// Open a database connection
const db = openDatabaseSync('focustabs.db');

// Track initialization state
let isInitialized = false;

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  // Prevent multiple initializations
  if (isInitialized) {
    return;
  }
  
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Ensure database is initialized before any operation
const ensureInitialized = async (): Promise<void> => {
  if (!isInitialized) {
    await initDatabase();
  }
};

interface SQLGoal extends Omit<Goal, 'completed' | 'createdAt' | 'updatedAt'> {
  completed: number;
  createdAt: string;
  updatedAt: string;
}

// Get all goals
export const getGoals = async (): Promise<Goal[]> => {
  try {
    await ensureInitialized();
    const result = await db.getAllAsync<SQLGoal>('SELECT * FROM goals ORDER BY createdAt DESC;');
    return result.map(goal => ({
      ...goal,
      completed: Boolean(goal.completed),
      createdAt: new Date(goal.createdAt),
      updatedAt: new Date(goal.updatedAt)
    }));
  } catch (error) {
    console.error('Error getting goals:', error);
    throw error;
  }
};

// Add a new goal
export const addGoal = async (goalInput: GoalInput): Promise<Goal> => {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  const goal: Goal = {
    id,
    text: goalInput.text,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    await ensureInitialized();
    await db.runAsync(
      'INSERT INTO goals (id, text, completed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?);',
      [id, goalInput.text, 0, now, now]
    );
    return goal;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

// Update a goal
export const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>): Promise<void> => {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.text !== undefined) {
    fields.push('text = ?');
    values.push(updates.text);
  }

  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed ? 1 : 0);
  }

  fields.push('updatedAt = ?');
  values.push(now);
  values.push(id);

  try {
    await ensureInitialized();
    await db.runAsync(
      `UPDATE goals SET ${fields.join(', ')} WHERE id = ?;`,
      values
    );
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

// Delete a goal
export const deleteGoal = async (id: string): Promise<void> => {
  try {
    await ensureInitialized();
    await db.runAsync('DELETE FROM goals WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// Clear all goals
export const clearGoals = async (): Promise<void> => {
  try {
    await ensureInitialized();
    await db.runAsync('DELETE FROM goals;');
  } catch (error) {
    console.error('Error clearing goals:', error);
    throw error;
  }
}; 