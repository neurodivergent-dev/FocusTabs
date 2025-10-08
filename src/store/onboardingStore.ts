import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: (completed: boolean) => void;
  resetState: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Varsayılan olarak onboarding gösterilecek (tamamlanmamış)
      hasCompletedOnboarding: false,
      
      // Onboarding durumunu güncelleme işlevi
      setOnboardingComplete: (completed: boolean) => {
        console.log('Onboarding completion status set to:', completed);
        set({ hasCompletedOnboarding: completed });
      },
      
      // Store'u sıfırlama işlevi
      resetState: () => {
        console.log('Resetting onboarding store state to default (not completed)');
        set({ hasCompletedOnboarding: false });
      }
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 