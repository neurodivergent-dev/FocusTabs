import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import { Goal, GoalInput, DailyCompletion } from '../types/goal';

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
      
      CREATE TABLE IF NOT EXISTS daily_completions (
        date TEXT PRIMARY KEY NOT NULL,
        completedCount INTEGER NOT NULL DEFAULT 0,
        totalCount INTEGER NOT NULL DEFAULT 0,
        percentage REAL NOT NULL DEFAULT 0
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

interface SQLDailyCompletion {
  date: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
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
    
    // Update daily completions for today
    await updateDailyCompletionStats();
    
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
    
    // If we're updating completion status, update daily stats
    if (updates.completed !== undefined) {
      await updateDailyCompletionStats();
    }
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
    
    // Update daily completions after deletion
    await updateDailyCompletionStats();
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
    
    // Update daily completions after clearing
    await updateDailyCompletionStats();
  } catch (error) {
    console.error('Error clearing goals:', error);
    throw error;
  }
};

// Format date to YYYY-MM-DD for storage
const formatDate = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Update daily completion statistics
export const updateDailyCompletionStats = async (): Promise<void> => {
  try {
    await ensureInitialized();
    
    // Get counts for today
    const todayDate = formatDate();
    const goals = await getGoals();
    const totalCount = goals.length;
    const completedCount = goals.filter(goal => goal.completed).length;
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Save or update today's stats
    await db.runAsync(
      `INSERT OR REPLACE INTO daily_completions (date, completedCount, totalCount, percentage) 
       VALUES (?, ?, ?, ?);`,
      [todayDate, completedCount, totalCount, percentage]
    );
  } catch (error) {
    console.error('Error updating daily completion stats:', error);
    throw error;
  }
};

// Get completion data for a date range
export const getCompletionsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<DailyCompletion[]> => {
  try {
    await ensureInitialized();
    
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    const result = await db.getAllAsync<SQLDailyCompletion>(
      `SELECT * FROM daily_completions 
       WHERE date >= ? AND date <= ? 
       ORDER BY date ASC;`,
      [formattedStartDate, formattedEndDate]
    );
    
    return result.map(item => ({
      date: item.date,
      completedCount: item.completedCount,
      totalCount: item.totalCount,
      percentage: item.percentage
    }));
  } catch (error) {
    console.error('Error getting completion data:', error);
    throw error;
  }
};

// Get all completion data
export const getAllCompletions = async (): Promise<DailyCompletion[]> => {
  try {
    await ensureInitialized();
    
    const result = await db.getAllAsync<SQLDailyCompletion>(
      `SELECT * FROM daily_completions ORDER BY date ASC;`
    );
    
    return result.map(item => ({
      date: item.date,
      completedCount: item.completedCount,
      totalCount: item.totalCount,
      percentage: item.percentage
    }));
  } catch (error) {
    console.error('Error getting all completion data:', error);
    throw error;
  }
}; 