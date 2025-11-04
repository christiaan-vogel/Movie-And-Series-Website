// auth.js - Minimal client-side auth gate (best-effort on static hosting)

const PWD_KEY = 'msw_pwd'; // stored in localStorage if user customizes
const SESSION_KEY = 'msw_authed';
const DEFAULT_PASSWORD = 'admin123'; // Change this by setting localStorage 'msw_pwd'

export function getExpectedPassword() {
  try {
    return localStorage.getItem(PWD_KEY) || DEFAULT_PASSWORD;
  } catch (e) {
    return DEFAULT_PASSWORD;
  }
}

export function setPassword(newPassword) {
  localStorage.setItem(PWD_KEY, newPassword);
}

export function login(inputPassword) {
  const expected = getExpectedPassword();
  if (inputPassword === expected) {
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function requireAuth(redirectTo = 'admin.html') {
  if (!isAuthenticated()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(redirectTo)}`;
  }
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
