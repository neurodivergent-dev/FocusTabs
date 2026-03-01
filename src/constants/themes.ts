// Uygulama temaları için sabitler
export interface ThemeOption {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    subText: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

const lightBase = {
  background: '#F2F2F7',
  card: '#FFFFFF', // Tam mat beyaz yaptık
  text: '#1C1C1E',
  subText: '#8E8E93',
  border: 'rgba(0, 0, 0, 0.05)',
  success: '#34C759',
  warning: '#FFCC00',
  error: '#FF3B30',
  info: '#007AFF',
};

const darkBase = {
  background: '#0F0F11',
  card: 'rgba(30, 30, 35, 0.6)',
  text: '#FFFFFF',
  subText: '#8E8E93',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#32D74B',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#0A84FF',
};

export const THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Cyberpunk',
    colors: {
      ...darkBase,
      primary: '#5E6AD2',
      secondary: '#A78BFA',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    colors: {
      ...darkBase,
      primary: '#F700FF',
      secondary: '#00FFFF',
    },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    colors: {
      ...darkBase,
      primary: '#00FF41',
      secondary: '#008F11',
    },
  },
  {
    id: 'plasma',
    name: 'Plasma',
    colors: {
      ...darkBase,
      primary: '#9D00FF',
      secondary: '#FF0055',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      ...darkBase,
      primary: '#FF2D55',
      secondary: '#FF9F0A',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      ...darkBase,
      primary: '#2AC9DE',
      secondary: '#5856D6',
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    colors: {
      ...darkBase,
      primary: '#FFD700',
      secondary: '#FFA500',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      ...darkBase,
      primary: '#10B981',
      secondary: '#059669',
    },
  },
];

export const getThemeById = (id: string): ThemeOption => {
  return THEMES.find((theme) => theme.id === id) || THEMES[0];
};

export const getThemeByIdAndMode = (id: string, isDark: boolean): ThemeOption => {
  const theme = getThemeById(id);
  if (isDark) return theme;
  
  // Create light version dynamically
  return {
    ...theme,
    colors: {
      ...lightBase,
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
    }
  };
};
