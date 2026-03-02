import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useThemeStore } from "../store/themeStore";
import { useLanguageStore } from "../store/languageStore";

export interface BackupData {
  version: string;
  timestamp: string;
  goals: Array<{
    id: string;
    text: string;
    completed: boolean;
    date: string;
    createdAt: string;
    updatedAt: string;
  }>;
  theme: {
    themeId: string;
    themeMode: "light" | "dark" | "system";
  };
  language: string;
}

/**
 * Export all app data to JSON
 */
export const exportData = (): BackupData => {
  const goals = useDailyGoalsStore.getState().goals;
  const theme = useThemeStore.getState();
  const language = useLanguageStore.getState().currentLanguage;

  const backupData: BackupData = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    goals: goals.map((goal) => ({
      id: goal.id,
      text: goal.text,
      completed: goal.completed,
      date: goal.date,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    })),
    theme: {
      themeId: theme.themeId,
      themeMode: theme.themeMode,
    },
    language: language || "en",
  };

  return backupData;
};

/**
 * Convert backup data to JSON string
 */
export const dataToJSON = (data: BackupData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Parse JSON string to backup data
 */
export const jsonToData = (jsonString: string): BackupData | null => {
  try {
    const data = JSON.parse(jsonString);
    // Validate the data structure
    if (!data.version || !data.goals || !data.theme) {
      return null;
    }
    return data as BackupData;
  } catch (error) {
    console.error("Failed to parse backup JSON:", error);
    return null;
  }
};

/**
 * Import backup data to app
 */
export const importData = (data: BackupData): boolean => {
  try {
    const { addGoal } = useDailyGoalsStore.getState();
    
    // Import goals
    data.goals.forEach((goal) => {
      addGoal({
        text: goal.text,
        category: (goal as any).category || 'other',
        date: (goal as any).date,
      });
    });

    // Import theme
    const { setThemeId, setThemeMode } = useThemeStore.getState();
    setThemeId(data.theme.themeId);
    setThemeMode(data.theme.themeMode);

    // Import language
    const { setLanguage } = useLanguageStore.getState();
    setLanguage(data.language);

    return true;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
};
