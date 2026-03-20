import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  isUnlimitedGoalsEnabled: boolean;
  setUnlimitedGoalsEnabled: (enabled: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  userImage: string | null;
  setUserImage: (uri: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isUnlimitedGoalsEnabled: false,
      setUnlimitedGoalsEnabled: (enabled: boolean) => set({ isUnlimitedGoalsEnabled: enabled }),
      userName: '',
      setUserName: (name: string) => set({ userName: name }),
      userImage: null,
      setUserImage: (uri: string | null) => set({ userImage: uri }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
