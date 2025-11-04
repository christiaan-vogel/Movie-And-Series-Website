// admin.js - Admin panel functionality

import { loadData, saveToLocal, exportDataTxt, importFromFile } from './dataStore.js';
import { parseText, stringifyItems, parseLine } from './parser.js';
import { getFile, putFile } from './github.js';
import { requireAuth, logout } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';

let currentItems = [];

function validateData(items) {
  const errors = [];
  
  items.forEach((item, index) => {
    const line = index + 1;
    
    if (!item.type) {
      errors.push(`Line ${line}: Missing type`);
    } else if (item.type !== 'movie' && item.type !== 'episode') {
      errors.push(`Line ${line}: Invalid type "${item.type}" (must be "movie" or "episode")`);
    }
    
    if (!item.title) {
      errors.push(`Line ${line}: Missing title`);
    }
    
    if (item.type === 'episode') {
      if (!item.series) errors.push(`Line ${line}: Episodes must have a series`);
      if (!item.season) errors.push(`Line ${line}: Episodes must have a season number`);
      if (!item.episode) errors.push(`Line ${line}: Episodes must have an episode number`);
    }
    
    if (item.year && isNaN(Number(item.year))) {
      errors.push(`Line ${line}: Year must be numeric`);
    }
    
    if (item.rating) {
      const rating = Number(item.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        errors.push(`Line ${line}: Rating must be a number between 0 and 10`);
      }
    }
  });
  
  return errors;
}

function displayValidation(errors) {
  const validation = document.getElementById('validation');
  if (!validation) return;
  
  if (errors.length === 0) {
    validation.innerHTML = '<div class="success">✓ Data is valid!</div>';
  } else {
    validation.innerHTML = `<div class="error"><strong>${errors.length} error(s) found:</strong><ul style="margin:0.5rem 0 0 1rem;">${errors.map(e => `<li>${e}</li>`).join('')}</ul></div>`;
  }
}

function setupEventListeners() {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => window.location.href = 'index.html');
  }
  
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const text = document.getElementById('rawData').value;
      const items = parseText(text);
      const blob = exportDataTxt(items);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.txt';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  
  const importBtn = document.getElementById('importBtn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const text = await file.text();
          document.getElementById('rawData').value = text;
          currentItems = parseText(text);
        }
      };
      input.click();
    });
  }
  
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const text = document.getElementById('rawData').value;
      const items = parseText(text);
      currentItems = items;
      const success = saveToLocal(items);
      
      const validation = document.getElementById('validation');
      if (validation) {
        validation.innerHTML = success 
          ? '<div class="success">✓ Saved to localStorage</div>'
          : '<div class="error">Failed to save to localStorage</div>';
      }
    });
  }
  
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => toggleTheme());
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      window.location.href = 'login.html?redirect=' + encodeURIComponent('admin.html');
    });
  }

  const validateBtn = document.getElementById('validateBtn');
  if (validateBtn) {
    validateBtn.addEventListener('click', () => {
      const text = document.getElementById('rawData').value;
      const items = parseText(text);
      const errors = validateData(items);
      displayValidation(errors);
    });
  }
  
  // GitHub integration
  const toggleToken = document.getElementById('toggleToken');
  if (toggleToken) {
    toggleToken.addEventListener('click', () => {
      const tokenInput = document.getElementById('ghToken');
      tokenInput.type = tokenInput.type === 'password' ? 'text' : 'password';
    });
  }
  
  const clearToken = document.getElementById('clearToken');
  if (clearToken) {
    clearToken.addEventListener('click', () => {
      localStorage.removeItem('gh_token');
      localStorage.removeItem('gh_owner');
      localStorage.removeItem('gh_repo');
      localStorage.removeItem('gh_branch');
      localStorage.removeItem('gh_path');
      document.getElementById('ghToken').value = '';
      document.getElementById('ghStatus').innerHTML = '<div class="success">✓ Cleared GitHub settings</div>';
    });
  }
  
  const testGH = document.getElementById('testGH');
  if (testGH) {
    testGH.addEventListener('click', async () => {
      const owner = document.getElementById('ghOwner').value;
      const repo = document.getElementById('ghRepo').value;
      const branch = document.getElementById('ghBranch').value;
      const path = document.getElementById('ghPath').value;
      const status = document.getElementById('ghStatus');
      
      if (!owner || !repo) {
        status.innerHTML = '<div class="error">Please fill in owner and repo</div>';
        return;
      }
      
      try {
        status.innerHTML = '<p>Testing...</p>';
        const result = await getFile(owner, repo, path, branch);
        status.innerHTML = `<div class="success">✓ Connection successful! File SHA: ${result.sha.substring(0, 7)}</div>`;
      } catch (err) {
        status.innerHTML = `<div class="error">Connection failed: ${err.message}</div>`;
      }
    });
  }
  
  const commitGH = document.getElementById('commitGH');
  if (commitGH) {
    commitGH.addEventListener('click', async () => {
      const owner = document.getElementById('ghOwner').value;
      const repo = document.getElementById('ghRepo').value;
      const branch = document.getElementById('ghBranch').value;
      const path = document.getElementById('ghPath').value;
      const token = document.getElementById('ghToken').value;
      const status = document.getElementById('ghStatus');
      
      if (!owner || !repo || !token) {
        status.innerHTML = '<div class="error">Please fill in all required fields</div>';
        return;
      }
      
      try {
        status.innerHTML = '<p>Getting current file...</p>';
        const current = await getFile(owner, repo, path, branch);
        
        const text = document.getElementById('rawData').value;
        const message = `Update ${path} - ${new Date().toISOString()}`;
        
        status.innerHTML = '<p>Committing...</p>';
        const result = await putFile(owner, repo, path, message, text, branch, current.sha, token);
        
        // Save settings
        localStorage.setItem('gh_owner', owner);
        localStorage.setItem('gh_repo', repo);
        localStorage.setItem('gh_branch', branch);
        localStorage.setItem('gh_path', path);
        if (document.getElementById('ghToken').value) {
          localStorage.setItem('gh_token', token);
        }
        
        status.innerHTML = `<div class="success">✓ Committed successfully! <a href="${result.commitUrl}" target="_blank" rel="noopener">View commit</a></div>`;
      } catch (err) {
        status.innerHTML = `<div class="error">Commit failed: ${err.message}</div>`;
      }
    });
  }
}

async function init() {
  requireAuth('admin.html');
  initTheme();
  currentItems = await loadData();
  const rawData = document.getElementById('rawData');
  if (rawData) {
    rawData.value = stringifyItems(currentItems);
  }
  
  // Load saved GitHub settings
  const ghOwner = localStorage.getItem('gh_owner');
  const ghRepo = localStorage.getItem('gh_repo');
  const ghBranch = localStorage.getItem('gh_branch');
  const ghPath = localStorage.getItem('gh_path');
  const ghToken = localStorage.getItem('gh_token');
  
  if (ghOwner) document.getElementById('ghOwner').value = ghOwner;
  if (ghRepo) document.getElementById('ghRepo').value = ghRepo;
  if (ghBranch) document.getElementById('ghBranch').value = ghBranch;
  if (ghPath) document.getElementById('ghPath').value = ghPath;
  if (ghToken) document.getElementById('ghToken').value = ghToken;
  
  setupEventListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
