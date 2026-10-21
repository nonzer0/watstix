import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { matchesHotkey, useHotkeys } from './useHotkeys';

const press = (
  key: string,
  init: KeyboardEventInit = {},
  target: EventTarget = document.body
) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
};

describe('matchesHotkey', () => {
  it('matches single keys case-insensitively and without modifiers', () => {
    expect(matchesHotkey('n', new KeyboardEvent('keydown', { key: 'N' }))).toBe(
      true
    );
    expect(
      matchesHotkey(
        'n',
        new KeyboardEvent('keydown', { key: 'n', metaKey: true })
      )
    ).toBe(false);
  });

  it('matches mod+ combos with either meta or ctrl', () => {
    expect(
      matchesHotkey(
        'mod+k',
        new KeyboardEvent('keydown', { key: 'k', metaKey: true })
      )
    ).toBe(true);
    expect(
      matchesHotkey(
        'mod+k',
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
      )
    ).toBe(true);
    expect(
      matchesHotkey('mod+k', new KeyboardEvent('keydown', { key: 'k' }))
    ).toBe(false);
  });

  it('matches named keys exactly', () => {
    expect(
      matchesHotkey(
        'ArrowDown',
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      )
    ).toBe(true);
  });
});

describe('useHotkeys', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('calls the handler and prevents the default action', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ n: handler }));

    const event = press('n');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores plain keys typed into inputs', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ n: handler }));
    const input = document.body.appendChild(document.createElement('input'));

    press('n', {}, input);
    expect(handler).not.toHaveBeenCalled();
  });

  it('still honours mod+ combos inside inputs', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ 'mod+k': handler }));
    const input = document.body.appendChild(document.createElement('input'));

    press('k', { metaKey: true }, input);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('leaves Enter on a focused button alone', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ Enter: handler }));
    const button = document.body.appendChild(document.createElement('button'));

    press('Enter', {}, button);
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores everything while a modal dialog is open', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ n: handler }));
    const dialog = document.body.appendChild(document.createElement('dialog'));
    dialog.setAttribute('open', '');

    press('n');
    expect(handler).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ n: handler }, false));

    press('n');
    expect(handler).not.toHaveBeenCalled();
  });
});
