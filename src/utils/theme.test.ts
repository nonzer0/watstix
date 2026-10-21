import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  nextThemePreference,
  readThemePreference,
  saveThemePreference,
} from './theme';

describe('theme utils', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('defaults to system when nothing is stored', () => {
    expect(readThemePreference()).toBe('system');
  });

  it('ignores unrecognised stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    expect(readThemePreference()).toBe('system');
  });

  it('round-trips an explicit preference and clears storage for system', () => {
    saveThemePreference('dark');
    expect(readThemePreference()).toBe('dark');
    saveThemePreference('system');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('falls back to system when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readThemePreference()).toBe('system');
  });

  it('does not throw when storage writes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => saveThemePreference('light')).not.toThrow();
  });

  it('sets data-theme for explicit preferences and removes it for system', () => {
    const root = document.documentElement;
    applyTheme('dark', root);
    expect(root.getAttribute('data-theme')).toBe('dark');
    applyTheme('system', root);
    expect(root.hasAttribute('data-theme')).toBe(false);
  });

  it('cycles system → light → dark → system', () => {
    expect(nextThemePreference('system')).toBe('light');
    expect(nextThemePreference('light')).toBe('dark');
    expect(nextThemePreference('dark')).toBe('system');
  });
});
