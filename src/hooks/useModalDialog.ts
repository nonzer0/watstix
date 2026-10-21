import { useEffect, useState, type RefObject } from 'react';

/**
 * Opens a <dialog> modally on mount, focuses the descendant marked
 * `data-autofocus`, and on unmount closes it and restores focus.
 */
export function useModalDialog(ref: RefObject<HTMLDialogElement>) {
  // Captured during render, before any autoFocus child steals focus on commit.
  const [returnFocusTo] = useState(
    () => document.activeElement as HTMLElement | null
  );

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      // jsdom has no showModal
      dialog.setAttribute('open', '');
    }
    // React's autoFocus cannot work here: focus() fails while the dialog is
    // still closed (display: none). Children mark their target instead.
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();

    return () => {
      if (typeof dialog.close === 'function') dialog.close();
      returnFocusTo?.focus?.();
    };
  }, [ref, returnFocusTo]);
}
