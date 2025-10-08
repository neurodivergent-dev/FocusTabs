import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dil dosyalarını içe aktar
import en from './locales/en';
import tr from './locales/tr';
import de from './locales/de';

// Kullanılabilir diller
export const LANGUAGES = {
  EN: 'en',
  TR: 'tr',
  DE: 'de',
};

// Varsayılan dil ve desteklenen diller
const SUPPORTED_LANGUAGES = [LANGUAGES.EN, LANGUAGES.TR, LANGUAGES.DE];
// Varsayılan dil olarak İngilizce kullan
const DEFAULT_LANGUAGE = LANGUAGES.EN;

// Önce cihaz dilini al
const getDeviceLanguage = () => {
  try {
    const deviceLocale = getLocales()[0];
    const deviceLanguage = deviceLocale?.languageCode;
    console.log('Device locale detected:', deviceLocale?.languageCode);
    
    // Eğer cihaz dili destekleniyorsa onu kullan
    if (deviceLanguage && SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
      return deviceLanguage;
    }
    
    // Özel durumlar için kontrol - "tr-TR", "de-DE" gibi bileşik kodlar
    if (deviceLanguage?.startsWith('tr')) {
      return LANGUAGES.TR;
    } else if (deviceLanguage?.startsWith('en')) {
      return LANGUAGES.EN;
    } else if (deviceLanguage?.startsWith('de')) {
      return LANGUAGES.DE;
    }
    
    // Desteklenmeyen diller için varsayılan İngilizce
    return DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Error detecting device language:', error);
    return DEFAULT_LANGUAGE;
  }
};

// İlk açılışta cihaz dilini al
const initialLanguage = getDeviceLanguage();
console.log('Initial device language for i18n:', initialLanguage);

// Initialize i18n with resources first
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    tr: {
      translation: tr,
    },
    de: {
      translation: de,
    },
  },
  fallbackLng: LANGUAGES.EN,
  interpolation: {
    escapeValue: false,
  },
  // Başlangıçta cihaz dilini kullan
  lng: initialLanguage,
  // React to changes in i18n language
  react: {
    useSuspense: false,
  },
});

// Try to load language from AsyncStorage
const loadStoredLanguage = async () => {
  try {
    // Check if we have a stored language preference
    const languageData = await AsyncStorage.getItem('language-storage');
    
    // Eğer daha önce bir dil ayarlanmışsa öncelikle onu kullan
    if (languageData) {
      const parsedData = JSON.parse(languageData);
      const storedLanguage = parsedData.state?.currentLanguage;
      
      // If we have a valid stored language, use it
      if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
        console.log('Loaded stored language:', storedLanguage);
        i18n.changeLanguage(storedLanguage);
        return;
      }
    }
    
    // Eğer saklanan bir dil yoksa, zaten cihaz dilini kullanıyoruz
    console.log('No stored language found, already using device language:', i18n.language);
    
  } catch (error) {
    console.error('Error loading language from storage:', error);
    // Hata durumunda varsayılan dil olarak İngilizce'yi kullan
    i18n.changeLanguage(DEFAULT_LANGUAGE);
  }
};

// Execute the language loading function
loadStoredLanguage();

export default i18n;