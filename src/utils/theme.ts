export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'watstix-theme';

const THEME_CYCLE: readonly ThemePreference[] = ['system', 'light', 'dark'];

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === 'string' &&
    (THEME_CYCLE as readonly string[]).includes(value)
  );
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function saveThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Storage unavailable (private mode, blocked); the in-memory choice still applies.
  }
}

/** System preference leaves the attribute off so the media query decides. */
export function applyTheme(
  preference: ThemePreference,
  root: HTMLElement = document.documentElement
): void {
  if (preference === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', preference);
  }
}

export function nextThemePreference(
  preference: ThemePreference
): ThemePreference {
  const index = THEME_CYCLE.indexOf(preference);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

export const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};
