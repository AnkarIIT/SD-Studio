import {
  BRAND_THEME_STORAGE_KEY,
  BRAND_THEME_STORAGE_KEY_LEGACY,
} from '../brand';

export type ThemePreference = 'system' | 'light' | 'dark';

export function getStoredThemePreference(): ThemePreference {
  let value = localStorage.getItem(BRAND_THEME_STORAGE_KEY);
  if (!value) {
    value = localStorage.getItem(BRAND_THEME_STORAGE_KEY_LEGACY);
    if (value) {
      localStorage.setItem(BRAND_THEME_STORAGE_KEY, value);
      localStorage.removeItem(BRAND_THEME_STORAGE_KEY_LEGACY);
    }
  }
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  return 'system';
}

export function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemePreference(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.themeResolved = resolved;
}

export function setThemePreference(preference: ThemePreference) {
  localStorage.setItem(BRAND_THEME_STORAGE_KEY, preference);
  applyThemePreference(preference);
}

/** system → light → dark → system */
export function cycleThemePreference(): ThemePreference {
  const current = getStoredThemePreference();
  const next: ThemePreference =
    current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
  setThemePreference(next);
  return next;
}

let systemListenerAttached = false;

export function initTheme() {
  applyThemePreference(getStoredThemePreference());

  if (systemListenerAttached) return;
  systemListenerAttached = true;

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredThemePreference() === 'system') {
      applyThemePreference('system');
    }
  });
}