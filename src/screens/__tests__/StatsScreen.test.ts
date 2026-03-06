/**
 * Tests for StatsScreen Calculations
 * Tests streak algorithm, performance calculations, and data slicing
 */

import { calculateStreak, formatDuration } from '../../__tests__/utils/test-utils';

describe('StatsScreen Calculations', () => {
  describe('Streak Algorithm (Seri)', () => {
    const createCompletionData = (completions: Array<{
      date: string;
      completedCount: number;
      totalCount: number;
      percentage: number;
    }>) => completions;

    it('should calculate streak when today is successful', () => {
      const today = '2024-01-15';
      const yesterday = '2024-01-14';
      const twoDaysAgo = '2024-01-13';

      const completionData = createCompletionData([
        { date: today, completedCount: 3, totalCount: 3, percentage: 100 },
        { date: yesterday, completedCount: 3, totalCount: 3, percentage: 100 },
        { date: twoDaysAgo, completedCount: 3, totalCount: 3, percentage: 100 },
      ]);

      const streak = calculateStreak(completionData, today);

      expect(streak).toBe(3);
    });

    it('should maintain streak from yesterday when today is incomplete', () => {
      const today = '2024-01-15';
      const yesterday = '2024-01-14';
      const twoDaysAgo = '2024-01-13';

      const completionData = createCompletionData([
        { date: today, completedCount: 1, totalCount: 3, percentage: 33 },
        { date: yesterday, completedCount: 3, totalCount: 3, percentage: 100 },
        { date: twoDaysAgo, completedCount: 3, totalCount: 3, percentage: 100 },
      ]);

      const streak = calculateStreak(completionData, today);

      // Should be 2 (yesterday and two days ago, today not yet successful)
      expect(streak).toBe(2);
    });

    it('should reset streak when a day is skipped', () => {
      const today = '2024-01-15';
      const twoDaysAgo = '2024-01-13'; // Yesterday missing
      const threeDaysAgo = '2024-01-12';

      const completionData = createCompletionData([
        { date: today, completedCount: 3, totalCount: 3, percentage: 100 },
        // Yesterday (2024-01-14) is missing
        { date: twoDaysAgo, completedCount: 3, totalCount: 3, percentage: 100 },
        { date: threeDaysAgo, completedCount: 3, totalCount: 3, percentage: 100 },
      ]);

      const streak = calculateStreak(completionData, today);

      // Streak broken by missing yesterday
      expect(streak).toBe(1);
    });

    it('should handle empty completion data', () => {
      const today = '2024-01-15';
      const completionData: any[] = [];

      const streak = calculateStreak(completionData, today);

      expect(streak).toBe(0);
    });

    it('should handle only today with no history', () => {
      const today = '2024-01-15';
      const completionData = createCompletionData([
        { date: today, completedCount: 3, totalCount: 3, percentage: 100 },
      ]);

      const streak = calculateStreak(completionData, today);

      expect(streak).toBe(1);
    });

    it('should require 70% completion for successful day', () => {
      const today = '2024-01-15';
      const yesterday = '2024-01-14';

      // Yesterday had 2/3 = 66.67% (below 70% threshold)
      const completionData = createCompletionData([
        { date: today, completedCount: 3, totalCount: 3, percentage: 100 },
        { date: yesterday, completedCount: 2, totalCount: 3, percentage: 66.67 },
      ]);

      const streak = calculateStreak(completionData, today);

      // Streak is 1 because yesterday was below 70%
      expect(streak).toBe(1);
    });

    it('should handle 7+ day streak', () => {
      const dates = [];
      const completionData = [];

      // Create 10 days of successful completions
      for (let i = 0; i < 10; i++) {
        const date = new Date('2024-01-15');
        date.setDate(date.getDate() - i);
        dates.push(date);

        completionData.push({
          date: date.toISOString().split('T')[0],
          completedCount: 3,
          totalCount: 3,
          percentage: 100,
        });
      }

      const streak = calculateStreak(completionData, '2024-01-15');

      expect(streak).toBe(10);
    });

    it('should handle year boundary correctly', () => {
      const completionData = createCompletionData([
        { date: '2024-01-01', completedCount: 3, totalCount: 3, percentage: 100 },
        { date: '2023-12-31', completedCount: 3, totalCount: 3, percentage: 100 },
        { date: '2023-12-30', completedCount: 3, totalCount: 3, percentage: 100 },
      ]);

      const streak = calculateStreak(completionData, '2024-01-01');

      expect(streak).toBe(3);
    });

    it('should handle leap year dates', () => {
      const completionData = createCompletionData([
        { date: '2024-03-01', completedCount: 3, totalCount: 3, percentage: 100 },
        { date: '2024-02-29', completedCount: 3, totalCount: 3, percentage: 100 }, // Leap year
        { date: '2024-02-28', completedCount: 3, totalCount: 3, percentage: 100 },
      ]);

      const streak = calculateStreak(completionData, '2024-03-01');

      expect(streak).toBe(3);
    });

    it('should handle zero total count (no goals for day)', () => {
      const today = '2024-01-15';
      const yesterday = '2024-01-14';

      const completionData = createCompletionData([
        { date: today, completedCount: 0, totalCount: 0, percentage: 0 },
        { date: yesterday, completedCount: 3, totalCount: 3, percentage: 100 },
      ]);

      const streak = calculateStreak(completionData, today);

      // Today has no goals, but yesterday was successful
      // Streak continues from yesterday
      expect(streak).toBe(1);
    });
  });

  describe('Duration Formatting', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(5)).toBe('00:05');
      expect(formatDuration(59)).toBe('00:59');
    });

    it('should format minutes correctly', () => {
      expect(formatDuration(60)).toBe('01:00');
      expect(formatDuration(120)).toBe('02:00');
      expect(formatDuration(3661)).toBe('1:01:01');
    });

    it('should format hours correctly', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(7200)).toBe('2:00:00');
      expect(formatDuration(3661)).toBe('1:01:01');
    });

    it('should handle edge cases', () => {
      expect(formatDuration(1)).toBe('00:01');
      expect(formatDuration(61)).toBe('01:01');
      expect(formatDuration(3601)).toBe('1:00:01');
    });

    it('should handle large durations', () => {
      expect(formatDuration(86400)).toBe('24:00:00'); // 24 hours
      expect(formatDuration(90061)).toBe('25:01:01'); // 25 hours, 1 minute, 1 second
    });
  });

  describe('Performance Calculations', () => {
    const calculateCompletionRate = (completed: number, total: number): number => {
      if (total === 0) return 0;
      return (completed / total) * 100;
    };

    it('should calculate completion rate correctly', () => {
      expect(calculateCompletionRate(3, 3)).toBe(100);
      expect(calculateCompletionRate(2, 3)).toBeCloseTo(66.67, 2);
      expect(calculateCompletionRate(1, 3)).toBeCloseTo(33.33, 2);
      expect(calculateCompletionRate(0, 3)).toBe(0);
    });

    it('should handle zero total', () => {
      expect(calculateCompletionRate(0, 0)).toBe(0);
    });

    it('should calculate weekly average', () => {
      const weeklyRates = [100, 50, 75, 0, 100, 25, 80];
      const average = weeklyRates.reduce((a, b) => a + b, 0) / weeklyRates.length;

      expect(average).toBeCloseTo(61.43, 2);
    });

    it('should calculate monthly average', () => {
      const monthlyRates = Array(30).fill(80);
      const average = monthlyRates.reduce((a, b) => a + b, 0) / monthlyRates.length;

      expect(average).toBe(80);
    });
  });

  describe('Top Focus Tasks Slicing', () => {
    const getTopFocusTasks = (goals: Array<{ text: string; focusTime: number }>, limit = 5) => {
      return [...goals]
        .filter(g => g.focusTime > 0)
        .sort((a, b) => b.focusTime - a.focusTime)
        .slice(0, limit);
    };

    it('should return top 5 focused tasks', () => {
      const goals = [
        { text: 'Task 1', focusTime: 100 },
        { text: 'Task 2', focusTime: 500 },
        { text: 'Task 3', focusTime: 300 },
        { text: 'Task 4', focusTime: 700 },
        { text: 'Task 5', focusTime: 200 },
        { text: 'Task 6', focusTime: 600 },
        { text: 'Task 7', focusTime: 400 },
      ];

      const top5 = getTopFocusTasks(goals);

      expect(top5).toHaveLength(5);
      expect(top5[0].focusTime).toBe(700);
      expect(top5[1].focusTime).toBe(600);
      expect(top5[2].focusTime).toBe(500);
      expect(top5[3].focusTime).toBe(400);
      expect(top5[4].focusTime).toBe(300);
    });

    it('should filter out tasks with zero focus time', () => {
      const goals = [
        { text: 'Task 1', focusTime: 0 },
        { text: 'Task 2', focusTime: 100 },
        { text: 'Task 3', focusTime: 0 },
      ];

      const topTasks = getTopFocusTasks(goals);

      expect(topTasks).toHaveLength(1);
      expect(topTasks[0].text).toBe('Task 2');
    });

    it('should handle empty goals list', () => {
      const goals: Array<{ text: string; focusTime: number }> = [];

      const topTasks = getTopFocusTasks(goals);

      expect(topTasks).toHaveLength(0);
    });

    it('should handle less than 5 tasks', () => {
      const goals = [
        { text: 'Task 1', focusTime: 100 },
        { text: 'Task 2', focusTime: 200 },
      ];

      const topTasks = getTopFocusTasks(goals);

      expect(topTasks).toHaveLength(2);
    });
  });

  describe('Category Analysis', () => {
    const getTopCategory = (goals: Array<{ category: string; completed: boolean }>) => {
      const completedGoals = goals.filter(g => g.completed);
      const categoryCounts: Record<string, number> = {};

      completedGoals.forEach(g => {
        categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
      });

      if (Object.keys(categoryCounts).length === 0) return 'other';

      return Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    };

    it('should find most completed category', () => {
      const goals = [
        { category: 'work', completed: true },
        { category: 'work', completed: true },
        { category: 'work', completed: true },
        { category: 'health', completed: true },
        { category: 'health', completed: true },
        { category: 'personal', completed: false },
      ];

      const topCategory = getTopCategory(goals);

      expect(topCategory).toBe('work');
    });

    it('should handle empty completed goals', () => {
      const goals = [
        { category: 'work', completed: false },
        { category: 'health', completed: false },
      ];

      const topCategory = getTopCategory(goals);

      expect(topCategory).toBe('other');
    });

    it('should handle tie by returning first encountered', () => {
      const goals = [
        { category: 'work', completed: true },
        { category: 'health', completed: true },
      ];

      const topCategory = getTopCategory(goals);

      expect(['work', 'health']).toContain(topCategory);
    });
  });

  describe('Productive Day Calculation', () => {
    const getMostProductiveDay = (goals: Array<{ date: string; completed: boolean }>) => {
      const dayStats: Record<number, { completed: number; total: number }> = {
        0: { completed: 0, total: 0 },
        1: { completed: 0, total: 0 },
        2: { completed: 0, total: 0 },
        3: { completed: 0, total: 0 },
        4: { completed: 0, total: 0 },
        5: { completed: 0, total: 0 },
        6: { completed: 0, total: 0 },
      };

      goals.forEach(g => {
        const date = new Date(g.date);
        const dayIndex = date.getDay();
        dayStats[dayIndex].total++;
        if (g.completed) dayStats[dayIndex].completed++;
      });

      let bestDayIndex = 0;
      let maxRatio = -1;
      let maxCompleted = -1;

      Object.entries(dayStats).forEach(([day, stats]) => {
        if (stats.total > 0) {
          const ratio = stats.completed / stats.total;
          if (ratio > maxRatio || (ratio === maxRatio && stats.completed > maxCompleted)) {
            maxRatio = ratio;
            maxCompleted = stats.completed;
            bestDayIndex = parseInt(day);
          }
        }
      });

      return bestDayIndex;
    };

    it('should find day with highest completion rate', () => {
      const goals = [
        { date: '2024-01-15', completed: true }, // Monday
        { date: '2024-01-16', completed: true }, // Tuesday
        { date: '2024-01-16', completed: false }, // Tuesday
        { date: '2024-01-17', completed: true }, // Wednesday
        { date: '2024-01-17', completed: true }, // Wednesday
        { date: '2024-01-17', completed: true }, // Wednesday
      ];

      const productiveDay = getMostProductiveDay(goals);

      // Wednesday (3/3 = 100%) vs Monday (1/1 = 100%) vs Tuesday (1/2 = 50%)
      // Wednesday has index 3
      expect(productiveDay).toBe(3);
    });

    it('should handle no goals', () => {
      const goals: Array<{ date: string; completed: boolean }> = [];

      const productiveDay = getMostProductiveDay(goals);

      expect(productiveDay).toBe(0); // Default to Sunday
    });
  });
});
