import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import { useModalDialog } from '../hooks/useModalDialog';
import { rankCommands } from '../utils/commandSearch';
import styles from './CommandPalette.module.css';

export type Command = {
  id: string;
  label: string;
  group: string;
  /** Extra search terms; not displayed. */
  keywords?: string;
  /** Secondary text shown after the label, e.g. the company. */
  detail?: string;
  icon?: ReactNode;
  /** Shortcut shown on the right, e.g. "N". */
  shortcut?: string;
  perform: () => void;
};

interface CommandPaletteProps {
  commands: Command[];
  onClose: () => void;
}

const MAX_RESULTS = 50;

export default function CommandPalette({
  commands,
  onClose,
}: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();

  useModalDialog(dialogRef);

  const results = useMemo(
    () => rankCommands(commands, query).slice(0, MAX_RESULTS),
    [commands, query]
  );
  const showGroups = query.trim() === '';

  const run = (command: Command) => {
    onClose();
    command.perform();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const last = results.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i >= last ? 0 : i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? last : i - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[activeIndex]) run(results[activeIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        onClose();
        break;
    }
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active]')
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex]);

  const activeId = results[activeIndex]
    ? `${listId}-${results[activeIndex].id}`
    : undefined;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Command palette"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.inputRow}>
          <Search aria-hidden="true" />
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Search applications and commands"
            placeholder="Search applications or type a command…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            data-autofocus
            spellCheck={false}
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <ul ref={listRef} id={listId} role="listbox" className={styles.list}>
          {results.length === 0 && (
            <li className={styles.empty} role="presentation">
              No results
            </li>
          )}
          {results.map((command, index) => {
            const startsGroup =
              showGroups &&
              (index === 0 || results[index - 1].group !== command.group);
            return (
              <CommandItem
                key={command.id}
                id={`${listId}-${command.id}`}
                command={command}
                groupLabel={startsGroup ? command.group : undefined}
                active={index === activeIndex}
                onHover={() => setActiveIndex(index)}
                onRun={() => run(command)}
              />
            );
          })}
        </ul>

        <div className={styles.footer}>
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> to navigate
          </span>
          <span>
            <kbd className="kbd">
              <CornerDownLeft className={styles.enterIcon} />
            </kbd>{' '}
            to select
          </span>
        </div>
      </div>
    </dialog>
  );
}

interface CommandItemProps {
  id: string;
  command: Command;
  groupLabel?: string;
  active: boolean;
  onHover: () => void;
  onRun: () => void;
}

function CommandItem({
  id,
  command,
  groupLabel,
  active,
  onHover,
  onRun,
}: CommandItemProps) {
  return (
    <>
      {groupLabel && (
        <li className={styles.group} role="presentation">
          {groupLabel}
        </li>
      )}
      <li
        id={id}
        role="option"
        aria-selected={active}
        data-active={active || undefined}
        className={styles.item}
        onMouseMove={onHover}
        onClick={onRun}
      >
        <span className={styles.icon}>{command.icon}</span>
        <span className={styles.label}>{command.label}</span>
        {command.detail && (
          <span className={styles.detail}>{command.detail}</span>
        )}
        {command.shortcut && <kbd className="kbd">{command.shortcut}</kbd>}
      </li>
    </>
  );
}
