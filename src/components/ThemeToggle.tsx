import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store';
import { THEME_LABELS } from '../utils/theme';

const ICONS = { system: Monitor, light: Sun, dark: Moon };

export default function ThemeToggle() {
  const preference = useThemeStore.use.preference();
  const cyclePreference = useThemeStore.use.cyclePreference();
  const Icon = ICONS[preference];

  return (
    <button
      type="button"
      onClick={cyclePreference}
      className="btn-ghost btn-icon"
      aria-label={`${THEME_LABELS[preference]} (click to change)`}
      title={THEME_LABELS[preference]}
    >
      <Icon />
    </button>
  );
}
