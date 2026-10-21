/** True when the event comes from a field where typed characters belong to the user. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag !== 'INPUT') return false;
  const type = (target as HTMLInputElement).type;
  return !['checkbox', 'radio', 'button', 'submit', 'reset'].includes(type);
}

/** ⌘↵ / Ctrl↵ submits the form from any field, including textareas. */
export function submitOnModEnter(e: React.KeyboardEvent<HTMLFormElement>) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    e.currentTarget.requestSubmit();
  }
}

export const MOD_KEY_LABEL =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
    ? '⌘'
    : 'Ctrl';
