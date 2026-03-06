/**
 * Database Mocks for Testing
 * Mock implementations for expo-sqlite operations
 */

export const mockGoals: any[] = [
  {
    id: 'test-goal-1',
    text: 'Test Goal 1',
    completed: 0,
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
    date: '2024-01-01',
    category: 'work',
    focusTime: 0,
    subTasks: null,
  },
  {
    id: 'test-goal-2',
    text: 'Test Goal 2',
    completed: 1,
    createdAt: '2024-01-01T11:00:00.000Z',
    updatedAt: '2024-01-01T12:00:00.000Z',
    date: '2024-01-01',
    category: 'health',
    focusTime: 1800,
    subTasks: null,
  },
];

export const mockDailyCompletions: any[] = [
  {
    date: '2024-01-01',
    completedCount: 1,
    totalCount: 2,
    percentage: 50,
  },
  {
    date: '2024-01-02',
    completedCount: 3,
    totalCount: 3,
    percentage: 100,
  },
  {
    date: '2024-01-03',
    completedCount: 0,
    totalCount: 3,
    percentage: 0,
  },
];

export const createMockDatabase = () => ({
  execAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
});

export const setupDatabaseMocks = (options?: {
  goals?: any[];
  completions?: any[];
  shouldFail?: boolean;
}) => {
  const { goals = mockGoals, completions = mockDailyCompletions, shouldFail = false } = options || {};

  jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
      execAsync: shouldFail
        ? jest.fn().mockRejectedValue(new Error('Database error'))
        : jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn().mockImplementation((query: string) => {
        if (query.includes('goals')) {
          return Promise.resolve(goals);
        }
        if (query.includes('daily_completions')) {
          return Promise.resolve(completions);
        }
        return Promise.resolve([]);
      }),
      getFirstAsync: jest.fn().mockResolvedValue(null),
      runAsync: shouldFail
        ? jest.fn().mockRejectedValue(new Error('Database error'))
        : jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    })),
  }));
};

export const clearDatabaseMocks = () => {
  jest.clearAllMocks();
};
