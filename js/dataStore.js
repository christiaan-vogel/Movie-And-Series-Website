// dataStore.js - Load, save, import, and export data

import { parseText, stringifyItems } from './parser.js';

const STORAGE_KEY = 'msw_data';
const SHA_KEY = 'msw_sha';

// Embedded sample data as fallback
const DEFAULT_DATA = `type=movie|title=Inception|year=2010|genres=Sci-Fi,Thriller|rating=8.8|status=watched|summary=A thief who steals corporate secrets through dream-sharing technology.
type=movie|title=The Matrix|year=1999|genres=Sci-Fi,Action|rating=8.7|status=watched|summary=A computer hacker learns about the true nature of reality.
type=episode|series=Breaking Bad|season=1|episode=1|title=Pilot|year=2008|genres=Crime,Drama|rating=9.0|status=watched|summary=A high school chemistry teacher turns to manufacturing meth.`;

export async function loadData() {
  // Try to fetch from data.txt
  try {
    const response = await fetch(`data/data.txt?_=${Date.now()}`);
    if (response.ok) {
      const text = await response.text();
      const items = await new Promise(resolve => {
        setTimeout(() => resolve(parseText(text)), 0);
      });
      return items;
    }
  } catch (err) {
    console.warn('Failed to fetch data.txt, falling back to localStorage:', err);
  }
  
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const items = await new Promise(resolve => {
        setTimeout(() => resolve(parseText(stored)), 0);
      });
      return items;
    }
  } catch (err) {
    console.warn('Failed to read from localStorage:', err);
  }
  
  // Final fallback to embedded sample
  const items = await new Promise(resolve => {
    setTimeout(() => resolve(parseText(DEFAULT_DATA)), 0);
  });
  return items;
}

export function saveToLocal(items) {
  try {
    const text = stringifyItems(items);
    localStorage.setItem(STORAGE_KEY, text);
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

export function exportDataTxt(items) {
  const text = stringifyItems(items);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  return blob;
}

export async function importFromFile(file) {
  const text = await file.text();
  const items = parseText(text);
  saveToLocal(items);
  return items;
}

export function getMeta(items) {
  const genresSet = new Set();
  const tagsSet = new Set();
  const statusSet = new Set();
  const yearsSet = new Set();
  
  for (const item of items) {
    if (item.genres) {
      item.genres.split(',').forEach(g => genresSet.add(g.trim()));
    }
    if (item.tags) {
      item.tags.split(',').forEach(t => tagsSet.add(t.trim()));
    }
    if (item.status) {
      statusSet.add(item.status);
    }
    if (item.year) {
      yearsSet.add(item.year);
    }
  }
  
  return {
    genres: Array.from(genresSet).sort(),
    tags: Array.from(tagsSet).sort(),
    statuses: Array.from(statusSet).sort(),
    years: Array.from(yearsSet).sort()
  };
}

export function getSHA() {
  return localStorage.getItem(SHA_KEY) || '';
}

export function setSHA(sha) {
  localStorage.setItem(SHA_KEY, sha);
}
