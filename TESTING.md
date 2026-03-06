# 🧪 FocusTabs - Testing Documentation

## 📋 Overview

This document describes the testing infrastructure for FocusTabs, a minimalist goal management app built with React Native, Expo SDK 55, and TypeScript.

**Testing Framework:** Jest + jest-expo  
**Coverage Target:** 80% minimum for `src/store` and `src/utils`  
**CI/CD:** CircleCI

---

## 🏗️ Testing Architecture

### Directory Structure

```
FocusTabs/
├── src/
│   ├── __mocks__/              # Mock implementations
│   │   ├── database.mock.ts
│   │   ├── secureStore.mock.ts
│   │   └── ai.mock.ts
│   ├── __tests__/
│   │   └── utils/
│   │       └── test-utils.ts   # Test utilities
│   ├── store/
│   │   └── __tests__/
│   │       ├── dailyGoalsStore.test.ts
│   │       └── aiStore.test.ts
│   ├── hooks/
│   │   └── __tests__/
│   │       └── useDailyReset.test.ts
│   ├── services/
│   │   └── __tests__/
│   │       └── aiService.test.ts
│   ├── utils/
│   │   └── __tests__/
│   │       └── backup.test.ts
│   └── screens/
│       └── __tests__/
│           └── StatsScreen.test.ts
├── jest.config.js
├── jest.setup.js
└── .circleci/
    └── config.yml
```

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests (watch mode)
npm test

# Run tests in CI mode (no watch, with coverage)
npm run test:ci

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Clear Jest cache
npm run test:clear
```

### Type Check & Lint

```bash
# TypeScript type checking
npm run typecheck

# ESLint
npm run lint

# ESLint with auto-fix
npm run lint:fix
```

---

## 📦 Test Coverage

### Coverage Targets

| Directory | Target | Current |
|-----------|--------|---------|
| `src/store` | 80% | ✅ Target |
| `src/utils` | 80% | ✅ Target |
| `src/hooks` | 70% | ✅ Target |
| `src/services` | 70% | ✅ Target |
| **Overall** | **75%** | ✅ Target |

### Coverage Reports

After running `npm run test:coverage`, reports are generated in:

- `coverage/lcov.info` - LCOV format (for Codecov)
- `coverage/index.html` - HTML report (open in browser)
- Console output - Text summary

---

## 🧩 Test Files

### 1. **dailyGoalsStore.test.ts**

Tests the core state management for daily goals.

**Coverage:**
- ✅ Goal CRUD operations
- ✅ 3 goals limit enforcement
- ✅ Timer start/stop/reset
- ✅ Focus time accumulation
- ✅ SubTask management
- ✅ Completion statistics
- ✅ Undo delete functionality

**Key Tests:**
```typescript
// 3 goals limit
await testThreeGoalsLimit(store, store.addGoal);

// Timer functionality
await testTimerFunctionality(store, goalId, startTimer, stopTimer, resetTimer);

// SubTask management
await toggleSubTask(goalId, 'sub-1');
await deleteSubTask(goalId, 'sub-1');
await updateSubTask(goalId, 'sub-1', 'Updated text');
```

---

### 2. **aiStore.test.ts**

Tests AI state management and API key handling.

**Coverage:**
- ✅ API key management (SecureStore)
- ✅ AI enable/disable toggle
- ✅ Celebration cache
- ✅ Chat message history (50 message limit)
- ✅ Persistence configuration

**Key Tests:**
```typescript
// API Key management
await setApiKey('test-api-key');
expect(state.apiKey).toBe('test-api-key');

// Chat history limit
for (let i = 0; i < 51; i++) {
  addChatMessage({ id: `msg-${i}`, text: `Message ${i}`, role: 'user', timestamp: Date.now() });
}
expect(state.chatMessages.length).toBe(50); // Limited to 50
```

---

### 3. **useDailyReset.test.ts**

Tests the daily reset hook and midnight calculation.

**Coverage:**
- ✅ App launch day check
- ✅ Background→Foreground transition
- ✅ Live midnight timer
- ✅ Date comparison logic
- ✅ Store refresh after reset

**Key Tests:**
```typescript
// Mock date to test day change
const yesterday = new Date('2024-01-14T23:59:00.000Z');
jest.setSystemTime(yesterday);

// Advance to next day
const tomorrow = new Date('2024-01-15T00:01:00.000Z');
jest.setSystemTime(tomorrow);

expect(Database.resetDailyGoals).toHaveBeenCalled();
```

---

### 4. **backup.test.ts**

Tests data export/import and schema versioning.

**Coverage:**
- ✅ JSON serialization/deserialization
- ✅ Schema v1.1.0 validation
- ✅ Backward compatibility (v1.0.0)
- ✅ Data integrity (focusTime, categories)
- ✅ Theme and language import

**Key Tests:**
```typescript
// Export data
const exported = exportData();
expect(exported.version).toBe('1.1.0');

// Import data
const success = importData(backupData);
expect(success).toBe(true);

// Backward compatibility
const v1Data = jsonToData(v1_0_json);
expect(v1Data).not.toBeNull();
```

---

### 5. **aiService.test.ts**

Tests AI service functionality.

**Coverage:**
- ✅ Caching mechanism (1 hour TTL)
- ✅ Cooldown logic (5s normal, 1s chat)
- ✅ Fallback model (2.5-flash → 1.5-flash)
- ✅ Goal refinement
- ✅ Goal decomposition (3 subtasks)
- ✅ Chat functionality
- ✅ Celebration messages

**Key Tests:**
```typescript
// Cache test
const result1 = await aiService.refineGoal('Test goal', 'en');
const result2 = await aiService.refineGoal('Test goal', 'en');
expect(GoogleGenerativeAI).toHaveBeenCalledTimes(1); // Cached

// Fallback test
await aiService.refineGoal('Test goal', 'en'); // 429 error
// Should automatically try fallback model
```

---

### 6. **StatsScreen.test.ts**

Tests statistical calculations.

**Coverage:**
- ✅ Streak algorithm (Seri)
- ✅ Duration formatting
- ✅ Completion rate calculations
- ✅ Top focus tasks slicing
- ✅ Category analysis
- ✅ Productive day calculation

**Key Tests:**
```typescript
// Streak calculation
const streak = calculateStreak(completionData, today);
expect(streak).toBe(10); // 10-day streak

// Edge case: Day skipped
const brokenStreak = calculateStreak(completionDataWithGap, today);
expect(brokenStreak).toBe(1); // Streak broken

// Duration formatting
expect(formatDuration(3661)).toBe('1:01:01');
```

---

## 🎭 Mocking Strategy

### Database Mocks (`database.mock.ts`)

```typescript
import { createMockDatabase, setupDatabaseMocks } from '../__mocks__/database.mock';

// In test
setupDatabaseMocks({
  goals: mockGoals,
  completions: mockCompletions,
  shouldFail: false,
});
```

### SecureStore Mocks (`secureStore.mock.ts`)

```typescript
import { setupSecureStoreMocks } from '../__mocks__/secureStore.mock';

// In test
setupSecureStoreMocks({
  apiKey: 'test-key',
  aiEnabled: true,
  shouldFail: false,
});
```

### AI SDK Mocks (`ai.mock.ts`)

```typescript
import { setupAIMocks } from '../__mocks__/ai.mock';

// In test
setupAIMocks({
  response: 'Custom response',
  shouldFail: false,
  quotaExceeded: false,
});
```

---

## 🔄 CI/CD Integration

### CircleCI Pipeline

```yaml
workflows:
  quality_gate:
    jobs:
      - build_and_test:
          filters:
            branches:
              only:
                - main
                - develop
                - test-.*

  nightly:
    triggers:
      - schedule:
          cron: "0 2 * * *"
          filters:
            branches:
              only:
                - main
    jobs:
      - build_and_test
```

### Pipeline Steps

1. **Checkout** - Get code from repository
2. **Install Dependencies** - npm install with cache
3. **TypeScript Check** - `tsc --noEmit`
4. **ESLint** - `eslint . --max-warnings=0`
5. **Jest Tests** - `jest --ci --forceExit --coverage`
6. **Upload Coverage** - Codecov integration
7. **Expo Doctor** - `npx expo doctor`

### Coverage Upload

```yaml
- codecov/upload:
    file: ./coverage/lcov.info
    flags: unittests
    fail_ci_if_error: false
```

---

## 📊 Test Utilities

### Helper Functions (`test-utils.ts`)

```typescript
import {
  waitForTime,
  flushPromises,
  mockDate,
  createMockGoal,
  createMockDailyCompletion,
  createMockChatMessage,
  testThreeGoalsLimit,
  testTimerFunctionality,
  calculateStreak,
  formatDuration,
} from '../__tests__/utils/test-utils';

// Example usage
const mockGoal = createMockGoal({
  text: 'Custom Goal',
  category: 'work',
  completed: true,
});

const streak = calculateStreak(completionData, today);
```

---

## 🐛 Debugging Tests

### Verbose Output

```bash
npm test -- --verbose
```

### Specific Test File

```bash
npm test -- src/store/__tests__/dailyGoalsStore.test.ts
```

### Specific Test Name

```bash
npm test -- --testNamePattern="should enforce 3 goals limit"
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## ✅ Best Practices

### 1. Test Naming

```typescript
describe('dailyGoalsStore', () => {
  describe('Goal Management', () => {
    it('should initialize with empty goals', () => { ... });
    it('should add a goal successfully', () => { ... });
    it('should enforce 3 goals limit per day', () => { ... });
  });
});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should toggle goal completion', async () => {
  // Arrange
  const { addGoal, toggleGoalCompletion } = useDailyGoalsStore.getState();
  await addGoal({ text: 'Test Goal', category: 'work' });
  const state = useDailyGoalsStore.getState();
  const goalId = state.goals[0].id;

  // Act
  await toggleGoalCompletion(goalId, true);

  // Assert
  const updatedState = useDailyGoalsStore.getState();
  expect(updatedState.goals[0].completed).toBe(true);
});
```

### 3. Cleanup

```typescript
beforeEach(() => {
  // Reset state
  useDailyGoalsStore.setState({ goals: [] });
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup
  jest.useRealTimers();
});
```

---

## 📈 Coverage Reports

### HTML Report

```bash
open coverage/index.html
```

### LCOV Report

View in Codecov dashboard: `https://app.codecov.io/gh/neurodivergent-dev/focustabs`

---

## 🔧 Troubleshooting

### Issue: Tests fail with "Cannot find module"

```bash
npm run test:clear
npm test
```

### Issue: Coverage below threshold

```bash
npm run test:coverage
# Check coverage/lcov.info for uncovered lines
```

### Issue: Mocks not working

Ensure mocks are imported before the module being tested:

```typescript
jest.mock('../../lib/database');
import { useDailyGoalsStore } from '../../dailyGoalsStore';
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [jest-expo](https://docs.expo.dev/guides/testing-with-jest/)
- [CircleCI Configuration](https://circleci.com/docs/)

---

## 🎯 Definition of Done

- [ ] Test environment configured and verified
- [ ] Mocks created for SQLite, SecureStore, and Google AI SDK
- [ ] Unit tests for all Zustand stores passing
- [ ] Backup/Restore edge cases verified
- [ ] CircleCI quality gate successfully integrated
- [ ] Minimum 80% code coverage for `src/store` and `src/utils`
- [ ] All tests pass in CI/CD pipeline

---

**Last Updated:** March 2026  
**Author:** FocusTabs Development Team
