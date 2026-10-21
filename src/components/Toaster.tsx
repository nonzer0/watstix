import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useToastStore, type Toast } from '../store';
import styles from './Toaster.module.css';

const TOAST_DURATION_MS = { default: 4000, success: 4000, error: 7000 };

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useToastStore.use.dismissToast();

  useEffect(() => {
    const timer = setTimeout(
      () => dismissToast(toast.id),
      TOAST_DURATION_MS[toast.tone]
    );
    return () => clearTimeout(timer);
  }, [toast.id, toast.tone, dismissToast]);

  return (
    <li className={styles.toast} data-tone={toast.tone}>
      {toast.tone === 'error' && <AlertCircle className={styles.icon} />}
      {toast.tone === 'success' && <CheckCircle2 className={styles.icon} />}
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className="btn-ghost btn-icon btn-sm"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
      >
        <X />
      </button>
    </li>
  );
}

export default function Toaster() {
  const toasts = useToastStore.use.toasts();

  return (
    <div role="status" aria-live="polite">
      <ol className={styles.region}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </ol>
    </div>
  );
}
