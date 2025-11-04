// parser.js - Parse and stringify pipe-delimited key=value format

const CANONICAL_KEYS = ['type', 'title', 'series', 'season', 'episode', 'year', 'genres', 'tags', 'rating', 'status', 'runtime', 'link', 'image', 'summary'];

export function escapeValue(val) {
  if (typeof val !== 'string') return String(val);
  return val.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

export function unescapeValue(val) {
  if (typeof val !== 'string') return val;
  return val.replace(/\\\|/g, '|').replace(/\\\\/g, '\\');
}

export function splitLineIntoTokens(line) {
  const tokens = [];
  let current = '';
  let escaped = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === '\\') {
      current += char;
      escaped = true;
    } else if (char === '|') {
      tokens.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) tokens.push(current.trim());
  return tokens;
}

export function parseLine(line) {
  const tokens = splitLineIntoTokens(line);
  const item = {
    type: '',
    title: '',
    series: '',
    season: '',
    episode: '',
    year: '',
    genres: '',
    tags: '',
    rating: '',
    status: '',
    runtime: '',
    link: '',
    image: '',
    summary: '',
    extras: {}
  };
  
  for (const token of tokens) {
    const eqIndex = token.indexOf('=');
    if (eqIndex === -1) continue;
    
    const key = token.substring(0, eqIndex).trim();
    const rawValue = token.substring(eqIndex + 1);
    const value = unescapeValue(rawValue);
    
    if (CANONICAL_KEYS.includes(key)) {
      item[key] = value;
    } else {
      item.extras[key] = value;
    }
  }
  
  return item;
}

export function stringifyItem(item) {
  const parts = [];
  
  for (const key of CANONICAL_KEYS) {
    const value = item[key];
    if (value !== undefined && value !== '') {
      parts.push(`${key}=${escapeValue(value)}`);
    }
  }
  
  // Add extras in sorted order
  if (item.extras) {
    const extraKeys = Object.keys(item.extras).sort();
    for (const key of extraKeys) {
      const value = item.extras[key];
      if (value !== undefined && value !== '') {
        parts.push(`${key}=${escapeValue(value)}`);
      }
    }
  }
  
  return parts.join('|');
}

export function parseText(text) {
  const lines = text.split(/\r?\n/);
  const items = [];
  
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    
    const item = parseLine(line);
    if (item.type) { // Only include if it has a type
      items.push(item);
    }
  }
  
  return items;
}

export function stringifyItems(items) {
  return items.map(item => stringifyItem(item)).join('\n');
}
