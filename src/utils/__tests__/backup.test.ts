/**
 * Tests for backup.ts
 * Tests data export/import functionality and schema versioning
 */

import {
  exportData,
  dataToJSON,
  jsonToData,
  importData,
  BackupData,
} from '../../utils/backup';
import { useDailyGoalsStore } from '../../store/dailyGoalsStore';
import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore } from '../../store/languageStore';

// Mock stores
jest.mock('../../store/dailyGoalsStore', () => ({
  useDailyGoalsStore: {
    getState: jest.fn(() => ({
      goals: [],
      addGoal: jest.fn(),
      resetAndRecalculateAllStats: jest.fn(),
    })),
  },
}));

jest.mock('../../store/themeStore', () => ({
  useThemeStore: {
    getState: jest.fn(() => ({
      themeId: 'default',
      themeMode: 'system' as const,
      setThemeId: jest.fn(),
      setThemeMode: jest.fn(),
    })),
  },
}));

jest.mock('../../store/languageStore', () => ({
  useLanguageStore: {
    getState: jest.fn(() => ({
      currentLanguage: 'en',
      setLanguage: jest.fn(),
    })),
  },
}));

describe('backup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportData', () => {
    it('should export data with correct schema version', () => {
      jest.mocked(useDailyGoalsStore.getState).mockReturnValue({
        goals: [],
        addGoal: jest.fn(),
        resetAndRecalculateAllStats: jest.fn(),
      } as any);

      const data = exportData();

      expect(data.version).toBe('1.1.0');
      expect(data.timestamp).toBeDefined();
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    it('should export goals with all fields', () => {
      const mockGoals = [
        {
          id: 'goal-1',
          text: 'Test Goal 1',
          completed: true,
          createdAt: new Date('2024-01-01T10:00:00.000Z'),
          updatedAt: new Date('2024-01-01T12:00:00.000Z'),
          date: '2024-01-01',
          category: 'work' as const,
          focusTime: 1800,
        },
        {
          id: 'goal-2',
          text: 'Test Goal 2',
          completed: false,
          createdAt: new Date('2024-01-02T10:00:00.000Z'),
          updatedAt: new Date('2024-01-02T10:00:00.000Z'),
          date: '2024-01-02',
          category: 'health' as const,
          focusTime: 0,
        },
      ];

      jest.mocked(useDailyGoalsStore.getState).mockReturnValue({
        goals: mockGoals,
        addGoal: jest.fn(),
        resetAndRecalculateAllStats: jest.fn(),
      } as any);

      const data = exportData();

      expect(data.goals.length).toBe(2);
      expect(data.goals[0]).toEqual({
        id: 'goal-1',
        text: 'Test Goal 1',
        completed: true,
        date: '2024-01-01',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
        category: 'work',
        focusTime: 1800,
      });
    });

    it('should export theme settings', () => {
      jest.mocked(useThemeStore.getState).mockReturnValue({
        themeId: 'neon',
        themeMode: 'dark' as const,
        setThemeId: jest.fn(),
        setThemeMode: jest.fn(),
      } as any);

      const data = exportData();

      expect(data.theme).toEqual({
        themeId: 'neon',
        themeMode: 'dark',
      });
    });

    it('should export language setting', () => {
      jest.mocked(useLanguageStore.getState).mockReturnValue({
        currentLanguage: 'tr',
        setLanguage: jest.fn(),
      } as any);

      const data = exportData();

      expect(data.language).toBe('tr');
    });

    it('should convert dates to ISO strings', () => {
      const mockGoals = [
        {
          id: 'goal-1',
          text: 'Test',
          completed: false,
          createdAt: new Date('2024-01-01T10:00:00.000Z'),
          updatedAt: new Date('2024-01-01T10:00:00.000Z'),
          date: '2024-01-01',
          category: 'other' as const,
          focusTime: 0,
        },
      ];

      jest.mocked(useDailyGoalsStore.getState).mockReturnValue({
        goals: mockGoals,
        addGoal: jest.fn(),
        resetAndRecalculateAllStats: jest.fn(),
      } as any);

      const data = exportData();

      expect(typeof data.goals[0].createdAt).toBe('string');
      expect(typeof data.goals[0].updatedAt).toBe('string');
      expect(data.goals[0].createdAt).toBe('2024-01-01T10:00:00.000Z');
    });
  });

  describe('dataToJSON', () => {
    it('should convert backup data to JSON string', () => {
      const mockData: BackupData = {
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'en',
      };

      const json = dataToJSON(mockData);

      expect(typeof json).toBe('string');
      expect(JSON.parse(json)).toEqual(mockData);
    });

    it('should format JSON with 2-space indentation', () => {
      const mockData: BackupData = {
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'en',
      };

      const json = dataToJSON(mockData);

      // Check for 2-space indentation
      expect(json).toContain('  "version"');
      expect(json).toContain('  "timestamp"');
    });

    it('should handle special characters in goal text', () => {
      const mockData: BackupData = {
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: 'goal-1',
            text: 'Test with "quotes" and \n newlines',
            completed: false,
            date: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            category: 'other',
            focusTime: 0,
          },
        ],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'en',
      };

      const json = dataToJSON(mockData);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed.goals[0].text).toBe('Test with "quotes" and \n newlines');
    });
  });

  describe('jsonToData', () => {
    it('should parse valid JSON string', () => {
      const jsonString = JSON.stringify({
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'en',
      });

      const data = jsonToData(jsonString);

      expect(data).not.toBeNull();
      expect(data?.version).toBe('1.1.0');
    });

    it('should return null for invalid JSON', () => {
      const invalidJson = '{ invalid json }';

      const data = jsonToData(invalidJson);

      expect(data).toBeNull();
    });

    it('should return null for missing version field', () => {
      const jsonString = JSON.stringify({
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
      });

      const data = jsonToData(jsonString);

      expect(data).toBeNull();
    });

    it('should return null for missing goals field', () => {
      const jsonString = JSON.stringify({
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'en',
      });

      const data = jsonToData(jsonString);

      expect(data).toBeNull();
    });

    it('should return null for missing theme field', () => {
      const jsonString = JSON.stringify({
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [],
        language: 'en',
      });

      const data = jsonToData(jsonString);

      expect(data).toBeNull();
    });

    it('should handle v1.0.0 backup files (backward compatibility)', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: 'goal-1',
            text: 'Old Goal',
            completed: false,
            date: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            category: 'other',
            focusTime: 0,
          },
        ],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'en',
      });

      const data = jsonToData(jsonString);

      expect(data).not.toBeNull();
      expect(data?.version).toBe('1.0.0');
      expect(data?.goals.length).toBe(1);
    });
  });

  describe('importData', () => {
    it('should import goals successfully', () => {
      const mockData: BackupData = {
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: 'goal-1',
            text: 'Imported Goal 1',
            completed: false,
            date: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            category: 'work',
            focusTime: 0,
          },
          {
            id: 'goal-2',
            text: 'Imported Goal 2',
            completed: true,
            date: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            category: 'health',
            focusTime: 1800,
          },
        ],
        theme: {
          themeId: 'neon',
          themeMode: 'dark',
        },
        language: 'tr',
      };

      const result = importData(mockData);

      expect(result).toBe(true);
      expect(useDailyGoalsStore.getState().addGoal).toHaveBeenCalledTimes(2);
      expect(useDailyGoalsStore.getState().addGoal).toHaveBeenCalledWith({
        text: 'Imported Goal 1',
        category: 'work',
        date: '2024-01-01',
        completed: false,
        focusTime: 0,
      });
    });

    it('should import theme settings', () => {
      const mockData: BackupData = {
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [],
        theme: {
          themeId: 'plasma',
          themeMode: 'light',
        },
        language: 'en',
      };

      importData(mockData);

      expect(useThemeStore.getState().setThemeId).toHaveBeenCalledWith('plasma');
      expect(useThemeStore.getState().setThemeMode).toHaveBeenCalledWith('light');
    });

    it('should import language setting', () => {
      const mockData: BackupData = {
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'tr',
      };

      importData(mockData);

      expect(useLanguageStore.getState().setLanguage).toHaveBeenCalledWith('tr');
    });

    it('should recalculate stats after import', () => {
      const mockData: BackupData = {
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: 'goal-1',
            text: 'Test',
            completed: true,
            date: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            category: 'work',
            focusTime: 0,
          },
        ],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'en',
      };

      importData(mockData);

      expect(
        useDailyGoalsStore.getState().resetAndRecalculateAllStats
      ).toHaveBeenCalled();
    });

    it('should handle import errors gracefully', () => {
      const mockData: BackupData = {
        version: '1.1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        goals: [{
          id: '1',
          text: 'Test Goal',
          completed: false,
          date: '2024-01-01',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          category: 'work',
          focusTime: 0
        }],
        theme: {
          themeId: 'default',
          themeMode: 'system',
        },
        language: 'en',
      };

      // Mock addGoal to throw error
      const mockAddGoal = jest.fn().mockImplementation(() => {
        throw new Error('Import error');
      });
      jest.mocked(useDailyGoalsStore.getState).mockReturnValue({
        goals: [],
        addGoal: mockAddGoal,
        resetAndRecalculateAllStats: jest.fn(),
      } as any);

      const result = importData(mockData);

      expect(result).toBe(false);
      expect(mockAddGoal).toHaveBeenCalled();
    });
  });

  describe('Data Integrity', () => {
    it('should preserve focusTime during export/import cycle', () => {
      const originalFocusTime = 3600;
      const mockGoals = [
        {
          id: 'goal-1',
          text: 'Test Goal',
          completed: false,
          createdAt: new Date('2024-01-01T10:00:00.000Z'),
          updatedAt: new Date('2024-01-01T10:00:00.000Z'),
          date: '2024-01-01',
          category: 'work' as const,
          focusTime: originalFocusTime,
        },
      ];

      jest.mocked(useDailyGoalsStore.getState).mockReturnValue({
        goals: mockGoals,
        addGoal: jest.fn(),
        resetAndRecalculateAllStats: jest.fn(),
      } as any);

      // Export
      const exported = exportData();
      const json = dataToJSON(exported);

      // Import
      const imported = jsonToData(json);
      if (imported) {
        importData(imported);

        expect(useDailyGoalsStore.getState().addGoal).toHaveBeenCalledWith(
          expect.objectContaining({
            focusTime: originalFocusTime,
          })
        );
      }
    });

    it('should preserve categories during export/import cycle', () => {
      const categories = ['work', 'health', 'personal', 'finance', 'other'] as const;

      const mockGoals = categories.map((category, index) => ({
        id: `goal-${index}`,
        text: `${category} Goal`,
        completed: false,
        createdAt: new Date('2024-01-01T10:00:00.000Z'),
        updatedAt: new Date('2024-01-01T10:00:00.000Z'),
        date: '2024-01-01',
        category,
        focusTime: 0,
      }));

      jest.mocked(useDailyGoalsStore.getState).mockReturnValue({
        goals: mockGoals,
        addGoal: jest.fn(),
        resetAndRecalculateAllStats: jest.fn(),
      } as any);

      // Export
      const exported = exportData();
      const json = dataToJSON(exported);

      // Import
      const imported = jsonToData(json);
      if (imported) {
        importData(imported);

        categories.forEach((category) => {
          expect(useDailyGoalsStore.getState().addGoal).toHaveBeenCalledWith(
            expect.objectContaining({
              category,
            })
          );
        });
      }
    });
  });
});
