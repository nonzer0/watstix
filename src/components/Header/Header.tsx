import { Briefcase, LogOut } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  setShowForm: (show: boolean) => void;
  signOut: () => void;
}

export function Header({ setShowForm, signOut }: HeaderProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.brand}>
        <div className={styles.icon}>
          <Briefcase />
        </div>
        <div>
          <h1>Application Tracker</h1>
          <p>Manage and track your job applications</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Add Application
        </button>
        <button onClick={signOut} className="btn-primary" title="Sign Out">
          <LogOut />
        </button>
      </div>
    </div>
  );
}
