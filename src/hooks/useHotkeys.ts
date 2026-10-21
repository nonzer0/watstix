import { useEffect, useRef } from 'react';
import { isEditableTarget } from '../utils/keyboard';

export type HotkeyHandler = (e: KeyboardEvent) => void;

/**
 * Key specs: a single key as reported by `KeyboardEvent.key` ("n", "/", "?",
 * "ArrowDown", "Enter", "Escape"), or "mod+<key>" for ⌘ on macOS / Ctrl elsewhere.
 */
export type HotkeyMap = Record<string, HotkeyHandler>;

export function matchesHotkey(spec: string, e: KeyboardEvent): boolean {
  if (spec.startsWith('mod+')) {
    return (
      (e.metaKey || e.ctrlKey) &&
      !e.altKey &&
      e.key.toLowerCase() === spec.slice(4).toLowerCase()
    );
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return false;
  return spec.length === 1
    ? e.key.toLowerCase() === spec.toLowerCase()
    : e.key === spec;
}

/** Whether a page-level shortcut should be ignored for this event. */
export function shouldIgnoreHotkey(spec: string, e: KeyboardEvent): boolean {
  if (e.defaultPrevented || e.isComposing) return true;
  // Open modal dialogs own the keyboard (they handle Esc themselves).
  if (document.querySelector('dialog[open]')) return true;
  const isModCombo = spec.startsWith('mod+');
  if (!isModCombo && isEditableTarget(e.target)) return true;
  // Let focused controls keep their native Enter / Space activation.
  if (
    (spec === 'Enter' || spec === ' ') &&
    e.target instanceof Element &&
    e.target.closest('a, button, [role="option"]')
  ) {
    return true;
  }
  return false;
}

export function useHotkeys(hotkeys: HotkeyMap, enabled = true) {
  const hotkeysRef = useRef(hotkeys);
  hotkeysRef.current = hotkeys;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const [spec, handler] of Object.entries(hotkeysRef.current)) {
        if (matchesHotkey(spec, e) && !shouldIgnoreHotkey(spec, e)) {
          e.preventDefault();
          handler(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
