import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Keyboard,
  LayoutList,
  LogOut,
  Plus,
  Search,
  SunMoon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useHotkeys } from '../hooks/useHotkeys';
import { useStore, useThemeStore } from '../store';
import { MOD_KEY_LABEL } from '../utils/keyboard';
import CommandPalette, { type Command } from './CommandPalette';
import Logo from './Logo';
import ShortcutsDialog from './ShortcutsDialog';
import StatusIcon from './StatusIcon';
import ThemeToggle from './ThemeToggle';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
  onNew?: () => void;
  /** Page-specific commands added to the palette. */
  commands?: Command[];
}

export default function AppShell({ children, onNew, commands }: AppShellProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const jobs = useStore.use.jobs();
  const cycleTheme = useThemeStore.use.cyclePreference();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const allCommands = useMemo<Command[]>(() => {
    const actions: Command[] = [];
    if (onNew) {
      actions.push({
        id: 'new',
        label: 'New application',
        group: 'Actions',
        icon: <Plus />,
        shortcut: 'N',
        perform: onNew,
      });
    }
    if (pathname !== '/') {
      actions.push({
        id: 'go-home',
        label: 'Go to applications',
        group: 'Actions',
        icon: <LayoutList />,
        perform: () => navigate('/'),
      });
    }
    actions.push(
      {
        id: 'theme',
        label: 'Change theme',
        group: 'Actions',
        keywords: 'dark light',
        icon: <SunMoon />,
        perform: cycleTheme,
      },
      {
        id: 'shortcuts',
        label: 'Keyboard shortcuts',
        group: 'Actions',
        icon: <Keyboard />,
        shortcut: '?',
        perform: () => setShortcutsOpen(true),
      },
      {
        id: 'sign-out',
        label: 'Sign out',
        group: 'Actions',
        icon: <LogOut />,
        perform: signOut,
      }
    );

    const jumpTo: Command[] = jobs.map((job) => ({
      id: `job-${job.id}`,
      label: job.position_title,
      detail: job.company_name,
      keywords: [job.company_name, job.location].filter(Boolean).join(' '),
      group: 'Applications',
      icon: <StatusIcon status={job.status} />,
      perform: () => navigate(`/job/${job.id}`),
    }));

    return [...actions, ...(commands ?? []), ...jumpTo];
  }, [onNew, pathname, navigate, cycleTheme, signOut, jobs, commands]);

  useHotkeys({
    'mod+k': () => setPaletteOpen((open) => !open),
    '?': () => setShortcutsOpen(true),
    ...(onNew ? { n: onNew } : {}),
  });

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.brand} aria-label="watstix home">
          <Logo />
          <span>watstix</span>
        </Link>
        <div className={styles.actions}>
          <button
            type="button"
            className={`btn ${styles.searchTrigger}`}
            onClick={() => setPaletteOpen(true)}
            aria-label="Search and commands"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <Search />
            <span className={styles.searchLabel}>Search…</span>
            <kbd className="kbd">{MOD_KEY_LABEL}K</kbd>
          </button>
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

      {paletteOpen && (
        <CommandPalette
          commands={allCommands}
          onClose={() => setPaletteOpen(false)}
        />
      )}
      {shortcutsOpen && (
        <ShortcutsDialog onClose={() => setShortcutsOpen(false)} />
      )}
    </div>
  );
}
