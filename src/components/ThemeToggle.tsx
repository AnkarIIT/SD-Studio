import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  cycleThemePreference,
  getStoredThemePreference,
  initTheme,
  resolveTheme,
  type ThemePreference,
} from '../utils/theme';

const LABELS: Record<ThemePreference, string> = {
  system: 'Theme: match system',
  light: 'Theme: light mode',
  dark: 'Theme: dark mode',
};

export default function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initTheme();
    setPreference(getStoredThemePreference());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="inline-block w-9 h-9" aria-hidden />;
  }

  const resolved = resolveTheme(preference);

  const Icon =
    preference === 'system' ? Monitor : preference === 'dark' ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => setPreference(cycleThemePreference())}
      className="p-2.5 text-[#111] dark:text-zinc-200 hover:opacity-60 transition-opacity relative"
      aria-label={LABELS[preference]}
      title={`${LABELS[preference]} (${resolved === 'dark' ? 'dark' : 'light'} now) — click to change`}
    >
      <Icon className="w-5 h-5" strokeWidth={1.5} />
      {preference === 'system' && (
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#111] dark:bg-white" />
      )}
    </button>
  );
}