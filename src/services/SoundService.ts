import { useThemeStore } from '../store/themeStore';

class SoundService {
  playComplete() {
    useThemeStore.getState().triggerSound('complete');
  }

  playDelete() {
    useThemeStore.getState().triggerSound('delete');
  }

  playUndo() {
    useThemeStore.getState().triggerSound('undo');
  }

  playClick() {
    useThemeStore.getState().triggerSound('click');
  }

  playFanfare() {
    useThemeStore.getState().triggerSound('fanfare');
  }
}

export const soundService = new SoundService();
