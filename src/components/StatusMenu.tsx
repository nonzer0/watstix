import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { Status } from '../types/types';
import { STATUS_LABELS, STATUS_ORDER } from '../utils/status';
import StatusIcon from './StatusIcon';
import styles from './StatusMenu.module.css';

interface StatusMenuProps {
  value: Status;
  onChange: (status: Status) => void;
  /** `icon` renders a compact glyph-only trigger for table rows. */
  variant?: 'icon' | 'label';
  /** Optional controlled open state (e.g. opened by a keyboard shortcut). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

const MENU_CLEARANCE = 240;

export default function StatusMenu({
  value,
  onChange,
  variant = 'label',
  open: openProp,
  onOpenChange,
  disabled,
}: StatusMenuProps) {
  const [openState, setOpenState] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState<'below' | 'above'>('below');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const open = openProp ?? openState;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, [setOpen]);

  const select = (status: Status) => {
    close();
    if (status !== value) onChange(status);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    const last = STATUS_ORDER.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i === last ? 0 : i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i === 0 ? last : i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(last);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        select(STATUS_ORDER[activeIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        if (/^[1-6]$/.test(e.key)) {
          e.preventDefault();
          select(STATUS_ORDER[Number(e.key) - 1]);
        }
    }
  };

  useEffect(() => {
    if (!open) return;
    setActiveIndex(Math.max(0, STATUS_ORDER.indexOf(value)));
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const roomBelow = window.innerHeight - rect.bottom;
      setPlacement(
        roomBelow < MENU_CLEARANCE && rect.top > MENU_CLEARANCE
          ? 'above'
          : 'below'
      );
    }
    listRef.current?.focus();
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open, setOpen]);

  const label = STATUS_LABELS[value];

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={variant === 'icon' ? `Status: ${label}` : undefined}
        title={variant === 'icon' ? `Status: ${label}` : undefined}
        className={variant === 'icon' ? styles.iconTrigger : styles.trigger}
      >
        <StatusIcon status={value} />
        {variant === 'label' && (
          <>
            <span>{label}</span>
            <ChevronDown className={styles.chevron} />
          </>
        )}
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label="Change status"
          aria-activedescendant={`${listId}-${STATUS_ORDER[activeIndex]}`}
          onKeyDown={handleListKeyDown}
          className={styles.menu}
          data-placement={placement}
        >
          {STATUS_ORDER.map((status, index) => (
            <li
              key={status}
              id={`${listId}-${status}`}
              role="option"
              aria-selected={status === value}
              data-active={index === activeIndex || undefined}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(status)}
              className={styles.option}
            >
              <StatusIcon status={status} />
              <span className={styles.optionLabel}>
                {STATUS_LABELS[status]}
              </span>
              {status === value && <Check className={styles.check} />}
              <span className={styles.shortcut}>{index + 1}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
