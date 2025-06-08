// Uygulama temaları için sabitler
export interface ThemeOption {
  id: string;
  name: string;
  colors: {
    // Genel tema renkleri
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    subText: string;
    border: string;
    // Bileşen özel renkleri
    cardBackground: string;
    cardBorder: string;
    headerBackground: string;
    buttonBackground: string;
    buttonText: string;
    // Durum renkleri
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

// Temalar
export const THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Varsayılan',
    colors: {
      // Açık tema
      primary: '#6366F1',
      secondary: '#EC4899',
      background: '#FFFFFF',
      card: '#F5F5F7',
      text: '#000000',
      subText: '#00000080',
      border: '#E5E5E5',
      cardBackground: '#F5F5F7',
      cardBorder: '#E5E5E5',
      headerBackground: '#FFFFFF',
      buttonBackground: '#6366F1',
      buttonText: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  {
    id: 'royal',
    name: 'Asil Mavi',
    colors: {
      primary: '#4338CA',
      secondary: '#3730A3',
      background: '#EEF2FF',
      card: '#E0E7FF',
      text: '#1E3A8A',
      subText: '#1E3A8A80',
      border: '#C7D2FE',
      cardBackground: '#E0E7FF',
      cardBorder: '#C7D2FE',
      headerBackground: '#EEF2FF',
      buttonBackground: '#4338CA',
      buttonText: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  {
    id: 'ocean',
    name: 'Okyanus',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      background: '#F0F9FF',
      card: '#E0F2FE',
      text: '#0C4A6E',
      subText: '#0C4A6E80',
      border: '#BAE6FD',
      cardBackground: '#E0F2FE',
      cardBorder: '#BAE6FD',
      headerBackground: '#F0F9FF',
      buttonBackground: '#0EA5E9',
      buttonText: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  {
    id: 'forest',
    name: 'Orman',
    colors: {
      primary: '#16A34A',
      secondary: '#22C55E',
      background: '#F0FDF4',
      card: '#DCFCE7',
      text: '#14532D',
      subText: '#14532D80',
      border: '#BBF7D0',
      cardBackground: '#DCFCE7',
      cardBorder: '#BBF7D0',
      headerBackground: '#F0FDF4',
      buttonBackground: '#16A34A',
      buttonText: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  {
    id: 'sunset',
    name: 'Gün Batımı',
    colors: {
      primary: '#F97316',
      secondary: '#F43F5E',
      background: '#FFF7ED',
      card: '#FFEDD5',
      text: '#7C2D12',
      subText: '#7C2D1280',
      border: '#FED7AA',
      cardBackground: '#FFEDD5',
      cardBorder: '#FED7AA',
      headerBackground: '#FFF7ED',
      buttonBackground: '#F97316',
      buttonText: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  {
    id: 'lavender',
    name: 'Lavanta',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A855F7',
      background: '#F5F3FF',
      card: '#EDE9FE',
      text: '#5B21B6',
      subText: '#5B21B680',
      border: '#DDD6FE',
      cardBackground: '#EDE9FE',
      cardBorder: '#DDD6FE',
      headerBackground: '#F5F3FF',
      buttonBackground: '#8B5CF6',
      buttonText: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
];

// Tema kimliğine göre tema seçme
export const getThemeById = (id: string): ThemeOption => {
  const theme = THEMES.find((theme) => theme.id === id);
  return theme || THEMES[0]; // Bulunamazsa varsayılan temayı döndür
};

// Koyu/açık tema modu ile tema kimliğine göre karma tema seçme
export const getThemeByIdAndMode = (id: string, isDark: boolean): ThemeOption => {
  // isDark true ise koyu renkli tema oluşturmak için ana temayı al
  if (!isDark) {
    return getThemeById(id); // Açık mod - direkt tema döndür
  }
  
  // Koyu mod için temanın koyu versiyonunu oluştur
  const lightTheme = getThemeById(id);
  
  // Her tema için özel koyu renkler
  const darkColors = {
    default: {
      background: '#121212',
      card: '#1F1F1F',
      headerBackground: '#121212',
      cardBackground: '#1F1F1F',
      cardBorder: '#2A2A2A',
      border: '#2A2A2A',
      text: '#FFFFFF',
      subText: '#FFFFFF80',
    },
    royal: {
      background: '#1E1B4B',
      card: '#2E2B6B',
      headerBackground: '#1E1B4B',
      cardBackground: '#2E2B6B',
      cardBorder: '#4338CA',
      border: '#3730A3',
      text: '#E0E7FF',
      subText: '#E0E7FF80',
    },
    ocean: {
      background: '#082F49',
      card: '#0C4A6E',
      headerBackground: '#082F49',
      cardBackground: '#0C4A6E',
      cardBorder: '#0EA5E9',
      border: '#0284C7',
      text: '#E0F2FE',
      subText: '#E0F2FE80',
    },
    forest: {
      background: '#052E16',
      card: '#14532D',
      headerBackground: '#052E16',
      cardBackground: '#14532D',
      cardBorder: '#16A34A',
      border: '#15803D',
      text: '#DCFCE7',
      subText: '#DCFCE780',
    },
    sunset: {
      background: '#431407',
      card: '#7C2D12',
      headerBackground: '#431407',
      cardBackground: '#7C2D12',
      cardBorder: '#F97316',
      border: '#EA580C',
      text: '#FFEDD5',
      subText: '#FFEDD580',
    },
    lavender: {
      background: '#3B0764',
      card: '#5B21B6',
      headerBackground: '#3B0764',
      cardBackground: '#5B21B6',
      cardBorder: '#8B5CF6',
      border: '#7C3AED',
      text: '#EDE9FE',
      subText: '#EDE9FE80',
    },
  };
  
  // Tema için özel koyu renkleri al
  const themeDarkColors = darkColors[id as keyof typeof darkColors] || darkColors.default;
  
  // Koyu tema versiyonu
  return {
    id: lightTheme.id,
    name: lightTheme.name,
    colors: {
      // Ana renkler korunur
      primary: lightTheme.colors.primary,
      secondary: lightTheme.colors.secondary,
      
      // Arka plan ve kart renkleri özel koyu renklere değiştirilir
      background: themeDarkColors.background,
      card: themeDarkColors.card,
      headerBackground: themeDarkColors.headerBackground,
      cardBackground: themeDarkColors.cardBackground,
      cardBorder: themeDarkColors.cardBorder,
      border: themeDarkColors.border,
      
      // Metin renkleri beyazlaştırılır
      text: themeDarkColors.text,
      subText: themeDarkColors.subText,
      buttonText: '#FFFFFF',
      
      // Buton renkleri korunur
      buttonBackground: lightTheme.colors.primary,
      
      // Durum renkleri korunur
      success: lightTheme.colors.success,
      warning: lightTheme.colors.warning,
      error: lightTheme.colors.error,
      info: lightTheme.colors.info,
    }
  };
}; 