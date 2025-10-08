import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/i18n';
import { LANGUAGES } from '../i18n/i18n';
import { useLanguageStore } from '../store/languageStore';

/**
 * Reset language settings completely to default (English)
 * This will:
 * 1. Clear the language storage from AsyncStorage
 * 2. Reset i18n language to English
 * 3. Reset the language store state using its own reset method
 */
export const resetLanguageSettings = async () => {
  try {
    console.log('Starting complete language reset...');
    
    // 1. Clear all language-related storage
    await AsyncStorage.removeItem('language-storage');
    console.log('Language storage cleared from AsyncStorage');
    
    // 2. Get a reference to the store
    const languageStore = useLanguageStore.getState();
    
    // 3. Reset state using the store's own reset method (which will also update i18n)
    if (languageStore && languageStore.resetState) {
      languageStore.resetState();
      console.log('Language store reset completed');
    } else {
      // Fallback in case resetState is not available
      console.log('Using fallback reset method');
      i18n.changeLanguage(LANGUAGES.EN);
      
      if (languageStore) {
        useLanguageStore.setState({
          ...languageStore,
          currentLanguage: LANGUAGES.EN
        });
      }
    }
    
    // 4. Verify the reset worked
    const afterResetLanguage = i18n.language;
    console.log('After reset - i18n language:', afterResetLanguage);
    
    return true;
  } catch (error) {
    console.error('Failed to reset language settings:', error);
    return false;
  }
};

/**
 * Get the current language storage data for debugging
 */
export const getLanguageStorageData = async () => {
  try {
    const data = await AsyncStorage.getItem('language-storage');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get language storage data:', error);
    return null;
  }
}; 