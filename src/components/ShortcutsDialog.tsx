import { MOD_KEY_LABEL } from '../utils/keyboard';
import Dialog from './Dialog';
import styles from './ShortcutsDialog.module.css';

const SECTIONS: { title: string; shortcuts: [string[], string][] }[] = [
  {
    title: 'General',
    shortcuts: [
      [[MOD_KEY_LABEL, 'K'], 'Search and commands'],
      [['N'], 'New application'],
      [['?'], 'Show keyboard shortcuts'],
    ],
  },
  {
    title: 'Applications list',
    shortcuts: [
      [['/'], 'Filter the list'],
      [['J'], 'Next row'],
      [['K'], 'Previous row'],
      [['↵'], 'Open application'],
      [['E'], 'Edit application'],
      [['S'], 'Change status'],
      [['Esc'], 'Clear filters / selection'],
    ],
  },
  {
    title: 'Forms and menus',
    shortcuts: [
      [[MOD_KEY_LABEL, '↵'], 'Save form'],
      [['1', '–', '6'], 'Pick status in the status menu'],
      [['Esc'], 'Close'],
    ],
  },
];

export default function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Keyboard shortcuts" onClose={onClose} size="sm">
      <div className={styles.sections}>
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className={styles.title}>{section.title}</h3>
            <dl className={styles.list}>
              {section.shortcuts.map(([keys, description]) => (
                <div key={description} className={styles.row}>
                  <dt>{description}</dt>
                  <dd>
                    {keys.map((key) =>
                      key === '–' ? (
                        <span key={key}>–</span>
                      ) : (
                        <kbd key={key} className="kbd">
                          {key}
                        </kbd>
                      )
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
