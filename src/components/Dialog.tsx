import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Dialog.module.css';

interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Forms keep this off so a stray click cannot discard input. */
  dismissOnBackdrop?: boolean;
  role?: 'dialog' | 'alertdialog';
}

export default function Dialog({
  title,
  onClose,
  children,
  size = 'md',
  dismissOnBackdrop = true,
  role = 'dialog',
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    return () => {
      if (typeof dialog.close === 'function') dialog.close();
      previouslyFocused?.focus?.();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dismissOnBackdrop && e.target === e.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      aria-modal="true"
      className={styles.dialog}
      data-size={size}
      onKeyDown={handleKeyDown}
      onCancel={handleCancel}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost btn-icon btn-sm"
            aria-label="Close"
          >
            <X />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}
