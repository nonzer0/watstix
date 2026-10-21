import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
  onNew?: () => void;
  /** Extra controls shown before the New button (e.g. the command palette trigger). */
  toolbar?: ReactNode;
}

export default function AppShell({ children, onNew, toolbar }: AppShellProps) {
  const { signOut } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.brand} aria-label="watstix home">
          <Logo />
          <span>watstix</span>
        </Link>
        <div className={styles.actions}>
          {toolbar}
          {onNew && (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={onNew}
              aria-keyshortcuts="N"
            >
              <Plus />
              New
              <kbd className="kbd">N</kbd>
            </button>
          )}
          <ThemeToggle />
          <button
            type="button"
            className="btn-ghost btn-icon"
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut />
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
