// app.js - Main application entry point

import { loadData, saveToLocal, exportDataTxt, importFromFile, getMeta } from './dataStore.js';
import { renderItems, renderModal, populateSelect } from './render.js';
import { initTheme, toggleTheme } from './theme.js';

let allItems = [];
let filteredItems = [];
let viewMode = 'grid';

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function getFilters() {
  return {
    search: document.getElementById('search')?.value.toLowerCase() || '',
    type: document.getElementById('filterType')?.value || '',
    status: document.getElementById('filterStatus')?.value || '',
    genre: document.getElementById('filterGenre')?.value || '',
    tag: document.getElementById('filterTag')?.value || ''
  };
}

function applyFilters() {
  const filters = getFilters();
  
  filteredItems = allItems.filter(item => {
    if (filters.search) {
      const searchText = `${item.title} ${item.series} ${item.genres} ${item.tags}`.toLowerCase();
      if (!searchText.includes(filters.search)) return false;
    }
    if (filters.type && item.type !== filters.type) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.genre && !item.genres?.includes(filters.genre)) return false;
    if (filters.tag && !item.tags?.includes(filters.tag)) return false;
    return true;
  });
  
  sortItems();
  renderAll();
}

function sortItems() {
  const sortBy = document.getElementById('sortBy')?.value || 'title';
  
  filteredItems.sort((a, b) => {
    switch(sortBy) {
      case 'year':
        return (b.year || '0').localeCompare(a.year || '0');
      case 'rating':
        return Number(b.rating || 0) - Number(a.rating || 0);
      case 'title':
      default:
        const titleA = a.series || a.title;
        const titleB = b.series || b.title;
        return titleA.localeCompare(titleB);
    }
  });
}

function renderAll() {
  const root = document.getElementById('itemsRoot');
  if (root) {
    root.innerHTML = renderItems(filteredItems, viewMode);
    attachCardListeners();
  }
}

function attachCardListeners() {
  document.querySelectorAll('.card, .list-row').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const item = filteredItems.find(i => 
        `${i.title}-${i.year || ''}-${i.series || ''}` === id
      );
      if (item) showModal(item);
    });
  });
}

function showModal(item) {
  const modal = document.getElementById('itemModal');
  if (modal) {
    modal.innerHTML = renderModal(item);
    modal.classList.add('open');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(applyFilters, 300));
  }
  
  ['filterType', 'filterStatus', 'filterGenre', 'filterTag', 'sortBy'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
  });
  
  const viewToggle = document.getElementById('viewToggle');
  if (viewToggle) {
    viewToggle.addEventListener('click', () => {
      viewMode = viewMode === 'grid' ? 'list' : 'grid';
      viewToggle.textContent = viewMode === 'grid' ? 'List' : 'Grid';
      renderAll();
    });
  }
  
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const blob = exportDataTxt(allItems);
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
          allItems = await importFromFile(file);
          updateMetaAndRender();
        }
      };
      input.click();
    });
  }
  
  const adminBtn = document.getElementById('adminBtn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  }
}

function updateMetaAndRender() {
  const meta = getMeta(allItems);
  populateSelect('filterGenre', meta.genres);
  populateSelect('filterTag', meta.tags);
  applyFilters();
}

async function init() {
  initTheme();
  allItems = await loadData();
  updateMetaAndRender();
  setupEventListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
