import { useConfirmStore } from '../store';
import Dialog from './Dialog';
import styles from './ConfirmDialog.module.css';

/** Host for useConfirm(); mount once near the app root. */
export default function ConfirmDialog() {
  const request = useConfirmStore.use.request();
  const settle = useConfirmStore.use.settle();

  if (!request) return null;

  return (
    <Dialog
      title={request.title}
      onClose={() => settle(false)}
      size="sm"
      role="alertdialog"
    >
      {request.message && <p className={styles.message}>{request.message}</p>}
      <div className="form-footer">
        <button type="button" className="btn" onClick={() => settle(false)}>
          Cancel
        </button>
        <button
          type="button"
          className={request.destructive ? 'btn-danger' : 'btn-primary'}
          onClick={() => settle(true)}
          autoFocus
        >
          {request.confirmLabel ?? 'Confirm'}
        </button>
      </div>
    </Dialog>
  );
}
