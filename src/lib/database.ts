import { openDatabaseSync } from 'expo-sqlite';
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
  
  // Doğrudan güncel şema ile tabloları oluştur (date alanı dahil)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      date TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS daily_completions (
      date TEXT PRIMARY KEY NOT NULL,
      completedCount INTEGER NOT NULL DEFAULT 0,
      totalCount INTEGER NOT NULL DEFAULT 0,
      percentage REAL NOT NULL DEFAULT 0
    );
  `);
  
  isInitialized = true;
  // console.log('Database initialized successfully');
};

// Ensure database is initialized before any operation
const ensureInitialized = async (): Promise<void> => {
  if (!isInitialized) {
    await initDatabase();
  }
};

interface SQLGoal {
  id: string;
  text: string;
  completed: number;
  createdAt: string;
  updatedAt: string;
  date: string;
}

interface SQLDailyCompletion {
  date: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

// Get all goals
export const getGoals = async (): Promise<Goal[]> => {
  await ensureInitialized();
  const result = await db.getAllAsync<SQLGoal>('SELECT * FROM goals ORDER BY date DESC, createdAt DESC;');
  
  const today = formatDate();
  
  return result.map(goal => ({
    ...goal,
    completed: Boolean(goal.completed),
    createdAt: new Date(goal.createdAt),
    updatedAt: new Date(goal.updatedAt),
    date: goal.date || today // Garanti olması için varsayılan değer
  }));
};

// Add a new goal
export const addGoal = async (goalInput: GoalInput): Promise<Goal> => {
  // Benzersiz ID oluştur - timestamp + random sayı
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000);
  const id = `${timestamp}-${randomPart}`;

  const now = new Date().toISOString();
  const today = formatDate();

  const goal: Goal = {
    id,
    text: goalInput.text,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    date: today,
  };

  await ensureInitialized();

  // Önce aynı ID'ye sahip bir görev var mı kontrol et
  const existingGoal = await db.getFirstAsync(
    'SELECT id FROM goals WHERE id = ?;',
    [id]
  );

  if (existingGoal) {
    // console.error(`ID çakışması: ${id} zaten mevcut. Yeni ID oluşturuluyor.`);
    // Recursive olarak tekrar dene (farklı ID ile)
    return addGoal(goalInput);
  }

  console.log(`Yeni görev ekleniyor, ID: ${id}, Text: ${goalInput.text}, Date: ${today}`);

  await db.runAsync(
    'INSERT INTO goals (id, text, completed, createdAt, updatedAt, date) VALUES (?, ?, ?, ?, ?, ?);',
    [id, goalInput.text, 0, now, now, today]
  );

  console.log(`Göv başarıyla eklendi!`);

  // Update daily completions for today
  await updateDailyCompletionStats();

  return goal;
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

  await ensureInitialized();
  await db.runAsync(
    `UPDATE goals SET ${fields.join(', ')} WHERE id = ?;`,
    values
  );
  
  // If we're updating completion status, update daily stats
  if (updates.completed !== undefined) {
    await updateDailyCompletionStats();
  }
};

// Delete a goal
export const deleteGoal = async (id: string): Promise<void> => {
  await ensureInitialized();
  await db.runAsync('DELETE FROM goals WHERE id = ?;', [id]);
  
  // Update daily completions after deletion
  await updateDailyCompletionStats();
};

// Clear all goals
export const clearGoals = async (): Promise<void> => {
  await ensureInitialized();
  await db.runAsync('DELETE FROM goals;');
  
  // Reset daily completions
  await updateDailyCompletionStats();
};

// Format date to YYYY-MM-DD for storage
const formatDate = (date: Date = new Date()): string => {
  // Local time kullanarak tarih tutarlılığını sağla
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  console.log('formatDate:', date.toString(), '->', formattedDate);

  return formattedDate;
};

// Reset daily goals (keep the goals but mark them as incomplete)
export const resetDailyGoals = async (): Promise<void> => {
  const today = formatDate();
  
  await ensureInitialized();
  
  // Update all today's goals to incomplete
  await db.runAsync(
    'UPDATE goals SET completed = 0, updatedAt = ? WHERE date = ?;',
    [new Date().toISOString(), today]
  );
  
  // Update daily completions stats
  await updateDailyCompletionStats();
};

// Update daily completion statistics
export const updateDailyCompletionStats = async (): Promise<void> => {
  await ensureInitialized();
  
  // Get counts for today
  const todayDate = formatDate();
  const goals = await getGoalsByDate(todayDate); // Sadece bugünün hedeflerini al
  const totalCount = goals.length;
  const completedCount = goals.filter(goal => goal.completed).length;
  
  // Hiç hedef yoksa, tamamlanma yüzdesi 0 olmalı
  // Hedefler varsa, tamamlanan hedeflerin yüzdesini hesapla
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  try {
    // First check if a record already exists for this date
    const existingRecord = await db.getFirstAsync<SQLDailyCompletion>(
      'SELECT * FROM daily_completions WHERE date = ?',
      [todayDate]
    );
    
    if (existingRecord) {
      // If it exists, update it
      await db.runAsync(
        `UPDATE daily_completions SET completedCount = ?, totalCount = ?, percentage = ? 
         WHERE date = ?;`,
        [completedCount, totalCount, percentage, todayDate]
      );
      // console.log(`${todayDate} tarihi için istatistikler güncellendi.`);
    } else {
      // If it doesn't exist, insert a new record
      await db.runAsync(
        `INSERT INTO daily_completions (date, completedCount, totalCount, percentage) 
         VALUES (?, ?, ?, ?);`,
        [todayDate, completedCount, totalCount, percentage]
      );
      // console.log(`${todayDate} tarihi için yeni istatistikler eklendi.`);
    }
  } catch (error) {
    console.error(`${todayDate} tarihli istatistikleri güncellerken hata:`, error);
    
    // As a fallback, try a "REPLACE INTO" operation which will either insert or replace
    try {
      await db.runAsync(
        `REPLACE INTO daily_completions (date, completedCount, totalCount, percentage) 
         VALUES (?, ?, ?, ?);`,
        [todayDate, completedCount, totalCount, percentage]
      );
      console.log(`${todayDate} tarihi için istatistikler REPLACE ile güncellendi.`);
    } catch (replaceError) {
      console.error(`${todayDate} tarihli istatistikleri REPLACE ile güncellerken hata:`, replaceError);
      throw replaceError;
    }
  }
};

// Get completions for a date range
export const getCompletionsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<DailyCompletion[]> => {
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

// Get all completions
export const getAllCompletions = async (): Promise<DailyCompletion[]> => {
  await ensureInitialized();
  const result = await db.getAllAsync<SQLDailyCompletion>(
    'SELECT * FROM daily_completions ORDER BY date ASC;'
  );
  
  return result.map(item => ({
    date: item.date,
    completedCount: item.completedCount,
    totalCount: item.totalCount,
    percentage: item.percentage
  }));
};

// Get goals for a specific date
export const getGoalsByDate = async (date: string): Promise<Goal[]> => {
  await ensureInitialized();
  
  // Tarih formatını kontrol et
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.error(`Geçersiz tarih formatı: ${date}`);
    return [];
  }
  
  // console.log(`${date} tarihi için hedefler getiriliyor`);
  
  const result = await db.getAllAsync<SQLGoal>(
    'SELECT * FROM goals WHERE date = ? ORDER BY createdAt DESC;',
    [date]
  );
  
  // console.log(`${date} için ${result.length} hedef bulundu`);
  
  return result.map(goal => ({
    ...goal,
    completed: Boolean(goal.completed),
    createdAt: new Date(goal.createdAt),
    updatedAt: new Date(goal.updatedAt),
    date: goal.date
  }));
};

// Reset and recalculate all completion statistics
export const resetAndRecalculateAllCompletionStats = async (): Promise<void> => {
  await ensureInitialized();
  
  // Tüm tamamlama verilerini sil
  // console.log('Tüm daily_completions verileri temizleniyor...');
  try {
    await db.runAsync('DELETE FROM daily_completions;');
    // console.log('Tüm daily_completions verileri başarıyla temizlendi.');
    
    // Kısa bir bekleme ekleyerek veritabanı işlemlerinin tamamlanmasını bekle
    await new Promise(resolve => setTimeout(resolve, 200));
  } catch (deleteError) {
    // console.error('Tüm daily_completions verilerini silerken hata:', deleteError);
    console.error('Tüm daily_completions verilerini silerken hata:', deleteError);
    // Devam et, her tarih için ayrı ayrı silip eklemeye çalışacağız
  }
  
  // Tüm benzersiz tarihleri al
  const result = await db.getAllAsync<{date: string}>(
    'SELECT DISTINCT date FROM goals ORDER BY date;'
  );
  
  console.log(`${result.length} benzersiz tarih bulundu, her biri için istatistikler yeniden hesaplanacak.`);
  
  // Her tarih için istatistikleri yeniden hesapla
  for (const { date } of result) {
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error(`Geçersiz tarih formatı, atlanıyor: ${date}`);
      continue;
    }
    
    try {
      // Bu tarih için tüm görevleri al
      const goals = await getGoalsByDate(date);
      const totalCount = goals.length;
      const completedCount = goals.filter(goal => goal.completed).length;
      
      // Tamamlanma yüzdesi hesapla
      const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      
      // Check if a record already exists for this date
      const existingRecord = await db.getFirstAsync<SQLDailyCompletion>(
        'SELECT * FROM daily_completions WHERE date = ?',
        [date]
      );
      
      if (existingRecord) {
        // If it exists, update it
        await db.runAsync(
          `UPDATE daily_completions SET completedCount = ?, totalCount = ?, percentage = ? 
           WHERE date = ?;`,
          [completedCount, totalCount, percentage, date]
        );
      } else {
        // If it doesn't exist, insert a new record
        await db.runAsync(
          `INSERT INTO daily_completions (date, completedCount, totalCount, percentage) 
           VALUES (?, ?, ?, ?);`,
          [date, completedCount, totalCount, percentage]
        );
      }
      
      console.log(`${date} tarihi için istatistikler güncellendi: ${completedCount}/${totalCount} (${percentage.toFixed(2)}%)`);
    } catch (error) {
      console.error(`${date} tarihli istatistikleri güncellerken hata:`, error);
      
      // As a fallback, try a "REPLACE INTO" operation
      try {
        await db.runAsync(
          `REPLACE INTO daily_completions (date, completedCount, totalCount, percentage) 
           VALUES (?, ?, ?, ?);`,
          [date, completedCount, totalCount, percentage]
        );
        console.log(`${date} tarihi için istatistikler REPLACE ile güncellendi.`);
      } catch (replaceError) {
        console.error(`${date} tarihli istatistikleri REPLACE ile güncellerken hata:`, replaceError);
        // Continue with other dates
      }
    }
    
    // Her tarih işlemi arasında kısa bir bekleme ekle
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Tüm tarihler için istatistikler yeniden hesaplandı.');
}; 