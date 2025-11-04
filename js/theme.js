// theme.js - Light/Dark mode handling

const THEME_KEY = 'msw_theme'; // 'light' | 'dark' | 'system'

export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  if (theme === 'light') root.classList.add('theme-light');
  if (theme === 'dark') root.classList.add('theme-dark');
}

export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY) || 'system';
  applyTheme(stored);
}

export function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'system';
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}
