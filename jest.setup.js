// Jest Setup File for FocusTabs
import '@testing-library/jest-native/extend-expect';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  })),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', regionCode: 'US' }]),
  getCalendars: jest.fn(() => []),
  findPhoneNumbersInText: jest.fn(),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('test-notification-id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///test/backup.json', name: 'backup.json' }],
  }),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test/documents/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn().mockResolvedValue(JSON.stringify({ test: 'data' })),
}));

// Mock expo-audio
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    release: jest.fn(),
    volume: 0.5,
  })),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 0,
    Medium: 1,
    Heavy: 2,
  },
  NotificationFeedbackType: {
    Success: 0,
    Warning: 1,
    Error: 2,
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
  },
  Stack: {
    Screen: jest.fn(() => null),
  },
  useSegments: jest.fn(() => []),
  useParams: jest.fn(() => ({})),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 390, height: 844 })),
  };
});

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Mocked AI response'),
        },
      }),
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue('Mocked chat response'),
          },
        }),
      }),
    }),
  })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Reanimated 2 has stopped working on the web
console.warn = () => {};

// Mock expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
    },
  },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  productName: 'Test Device',
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: jest.fn(() => null),
  useCameraPermissions: jest.fn(() => [true, {}]),
}));

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: jest.fn(({ children }) => children),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: jest.fn(({ children }) => children),
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const LucideMock = jest.fn(({ name, ...props }) => null);
  const icons = [
    'Home', 'Calendar', 'BarChart2', 'Settings', 'Sparkles',
    'Check', 'Trash2', 'Edit2', 'X', 'Target', 'Briefcase',
    'Heart', 'User', 'DollarSign', 'Tag', 'Play', 'Pause',
    'Timer', 'Scissors', 'ChevronDown', 'ChevronUp', 'RotateCcw',
    'Plus', 'BrainCircuit', 'Send', 'Bot', 'AlertCircle',
    'Download', 'Upload', 'Info', 'ChevronLeft', 'Moon', 'Sun',
    'Smartphone', 'Paintbrush', 'Languages', 'CloudUpload',
    'Volume2', 'VolumeX', 'Lock', 'Star', 'Layout', 'RefreshCw',
    'CheckCircle', 'CheckCircle2', 'AlertTriangle', 'Circle',
    'Clock', 'TrendingUp', 'Award', 'Lightbulb', 'BrainCircuit',
    'Waves', 'CircleOff', 'Atom', 'Hexagon', 'ArrowLeft',
    'Terminal', 'Palette', 'Box',
  ];
  const module = {};
  icons.forEach(icon => {
    module[icon] = LucideMock;
  });
  return module;
});
