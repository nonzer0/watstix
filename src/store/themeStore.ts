import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  applyTheme,
  nextThemePreference,
  readThemePreference,
  saveThemePreference,
  type ThemePreference,
} from '../utils/theme';
import { createSelectors } from './store';

const useThemeStoreBase = create(
  combine({ preference: readThemePreference() }, (set, get) => {
    const setPreference = (preference: ThemePreference) => {
      applyTheme(preference);
      saveThemePreference(preference);
      set({ preference });
    };

    return {
      setPreference,
      cyclePreference: () =>
        setPreference(nextThemePreference(get().preference)),
    };
  })
);

export const useThemeStore = createSelectors(useThemeStoreBase);
