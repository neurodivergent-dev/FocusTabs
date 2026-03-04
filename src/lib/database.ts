import { openDatabaseSync } from 'expo-sqlite';
import { Goal, GoalInput, DailyCompletion, GoalCategory } from '../types/goal';

const db = openDatabaseSync('focustabs.db');

// Promise-based initialization lock to prevent race conditions
let initPromise: Promise<void> | null = null;

export const initDatabase = async (): Promise<void> => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    console.log('[DATABASE] Initializing schema and migrations...');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'other',
        focusTime INTEGER NOT NULL DEFAULT 0,
        subTasks TEXT
      );
      
      CREATE TABLE IF NOT EXISTS daily_completions (
        date TEXT PRIMARY KEY NOT NULL,
        completedCount INTEGER NOT NULL DEFAULT 0,
        totalCount INTEGER NOT NULL DEFAULT 0,
        percentage REAL NOT NULL DEFAULT 0
      );
    `);

    // Migrations
    try { await db.execAsync("ALTER TABLE goals ADD COLUMN category TEXT NOT NULL DEFAULT 'other';"); } catch (e) {}
    try { await db.execAsync("ALTER TABLE goals ADD COLUMN focusTime INTEGER NOT NULL DEFAULT 0;"); } catch (e) {}
    try { await db.execAsync("ALTER TABLE goals ADD COLUMN subTasks TEXT;"); } catch (e) {}
    
    console.log('[DATABASE] Ready.');
  })();

  return initPromise;
};

const ensureInitialized = async (): Promise<void> => {
  await initDatabase();
};

interface SQLGoal {
  id: string;
  text: string;
  completed: number;
  createdAt: string;
  updatedAt: string;
  date: string;
  category: string;
  focusTime: number;
  subTasks: string | null;
}

interface SQLDailyCompletion {
  date: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export const getGoals = async (): Promise<Goal[]> => {
  await ensureInitialized();
  const result = await db.getAllAsync<SQLGoal>('SELECT * FROM goals ORDER BY date DESC, createdAt DESC;');
  const today = formatDate();
  
  return result.map(goal => ({
    ...goal,
    completed: Boolean(goal.completed),
    createdAt: new Date(goal.createdAt),
    updatedAt: new Date(goal.updatedAt),
    date: goal.date || today,
    category: (goal.category as GoalCategory) || 'other',
    focusTime: goal.focusTime || 0,
    subTasks: goal.subTasks ? JSON.parse(goal.subTasks) : undefined
  }));
};

export const addGoal = async (goalInput: GoalInput): Promise<Goal> => {
  const timestamp = Date.now();
  const id = `${timestamp}-${Math.floor(Math.random() * 10000)}`;
  const now = new Date().toISOString();
  const today = formatDate();

  const goal: Goal = {
    id,
    text: goalInput.text,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    date: today,
    category: goalInput.category,
    focusTime: 0,
  };

  await ensureInitialized();
  await db.runAsync(
    'INSERT INTO goals (id, text, completed, createdAt, updatedAt, date, category, focusTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    [id, goalInput.text, 0, now, now, today, goalInput.category, 0]
  );

  await updateDailyCompletionStats();
  return goal;
};

export const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>): Promise<void> => {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.text !== undefined) { fields.push('text = ?'); values.push(updates.text); }
  if (updates.completed !== undefined) { fields.push('completed = ?'); values.push(updates.completed ? 1 : 0); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.focusTime !== undefined) { fields.push('focusTime = ?'); values.push(updates.focusTime); }
  if (updates.subTasks !== undefined) { fields.push('subTasks = ?'); values.push(JSON.stringify(updates.subTasks)); }

  fields.push('updatedAt = ?');
  values.push(now);
  values.push(id);

  await ensureInitialized();
  await db.runAsync(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?;`, values);
  
  if (updates.completed !== undefined) {
    await updateDailyCompletionStats();
  }
};

export const deleteGoal = async (id: string): Promise<void> => {
  await ensureInitialized();
  await db.runAsync('DELETE FROM goals WHERE id = ?;', [id]);
  await updateDailyCompletionStats();
};

export const clearGoals = async (): Promise<void> => {
  await ensureInitialized();
  await db.runAsync('DELETE FROM goals;');
  await db.runAsync('DELETE FROM daily_completions;');
  await updateDailyCompletionStats();
};

const formatDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const resetDailyGoals = async (): Promise<void> => {
  const today = formatDate();
  await ensureInitialized();
  await db.runAsync('UPDATE goals SET completed = 0, updatedAt = ? WHERE date = ?;', [new Date().toISOString(), today]);
  await updateDailyCompletionStats();
};

export const updateDailyCompletionStats = async (): Promise<void> => {
  await ensureInitialized();
  const todayDate = formatDate();
  const goals = await getGoalsByDate(todayDate);
  const totalCount = goals.length;
  const completedCount = goals.filter(goal => goal.completed).length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO daily_completions (date, completedCount, totalCount, percentage) 
       VALUES (?, ?, ?, ?);`,
      [todayDate, completedCount, totalCount, percentage]
    );
  } catch (error) {
    console.error('[DATABASE] Stats update error:', error);
  }
};

export const getCompletionsByDateRange = async (startDate: Date, endDate: Date): Promise<DailyCompletion[]> => {
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  await ensureInitialized();
  const result = await db.getAllAsync<SQLDailyCompletion>(
    'SELECT * FROM daily_completions WHERE date >= ? AND date <= ? ORDER BY date ASC;',
    [startStr, endStr]
  );
  return result.map(item => ({
    date: item.date,
    completedCount: item.completedCount,
    totalCount: item.totalCount,
    percentage: item.percentage
  }));
};

export const getAllCompletions = async (): Promise<DailyCompletion[]> => {
  await ensureInitialized();
  const result = await db.getAllAsync<SQLDailyCompletion>('SELECT * FROM daily_completions ORDER BY date ASC;');
  return result.map(item => ({
    date: item.date,
    completedCount: item.completedCount,
    totalCount: item.totalCount,
    percentage: item.percentage
  }));
};

export const getGoalsByDate = async (date: string): Promise<Goal[]> => {
  await ensureInitialized();
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) return [];
  
  const result = await db.getAllAsync<SQLGoal>(
    'SELECT * FROM goals WHERE date = ? ORDER BY createdAt DESC;',
    [date]
  );
  
  return result.map(goal => ({
    ...goal,
    completed: Boolean(goal.completed),
    createdAt: new Date(goal.createdAt),
    updatedAt: new Date(goal.updatedAt),
    date: goal.date,
    category: (goal.category as GoalCategory) || 'other',
    focusTime: goal.focusTime || 0,
    subTasks: goal.subTasks ? JSON.parse(goal.subTasks) : undefined
  }));
};

export const resetAndRecalculateAllCompletionStats = async (): Promise<void> => {
  await ensureInitialized();
  try {
    await db.runAsync('DELETE FROM daily_completions;');
    const result = await db.getAllAsync<{date: string}>('SELECT DISTINCT date FROM goals ORDER BY date;');
    for (const { date } of result) {
      const goals = await getGoalsByDate(date);
      const totalCount = goals.length;
      const completedCount = goals.filter(goal => goal.completed).length;
      const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      await db.runAsync(
        'INSERT OR REPLACE INTO daily_completions (date, completedCount, totalCount, percentage) VALUES (?, ?, ?, ?);',
        [date, completedCount, totalCount, percentage]
      );
    }
  } catch (error) {
    console.error('[DATABASE] Recalculate error:', error);
  }
};
