import { useEffect, type RefObject } from 'react';

/** Opens a <dialog> modally on mount; closes it and restores focus on unmount. */
export function useModalDialog(ref: RefObject<HTMLDialogElement>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      // jsdom has no showModal
      dialog.setAttribute('open', '');
    }

    return () => {
      if (typeof dialog.close === 'function') dialog.close();
      previouslyFocused?.focus?.();
    };
  }, [ref]);
}
