// render.js - UI rendering functions

export function renderStars(rating) {
  if (!rating) return '';
  const stars = '★'.repeat(Math.round(Number(rating))) + '☆'.repeat(10 - Math.round(Number(rating)));
  return `<span class="stars" title="${rating}/10">${stars}</span>`;
}

export function getInitials(title) {
  return title.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export function renderBadge(text, type) {
  return `<span class="badge ${type}">${text}</span>`;
}

export function renderCard(item) {
  const title = item.series ? `${item.series} S${item.season}E${item.episode}` : item.title;
  const subtitle = item.series ? item.title : `${item.year || ''}`;
  
  return `
    <div class="card" data-id="${item.title}-${item.year || ''}-${item.series || ''}">
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <p class="card-meta">${subtitle}</p>
        <div class="badges">
          ${renderBadge(item.type, `type-${item.type}`)}
          ${item.status ? renderBadge(item.status, `status-${item.status}`) : ''}
          ${item.rating ? renderStars(item.rating) : ''}
        </div>
      </div>
    </div>
  `;
}

export function renderListRow(item) {
  const title = item.series ? `${item.series} S${item.season}E${item.episode}: ${item.title}` : item.title;
  const meta = [item.year, item.genres, item.rating ? `⭐ ${item.rating}` : ''].filter(Boolean).join(' • ');
  
  return `
    <div class="list-row" data-id="${item.title}-${item.year || ''}-${item.series || ''}">
      <div class="list-row-content">
        <h3 class="list-row-title">${title}</h3>
        <p class="list-row-meta">${meta}</p>
        <div class="badges">
          ${renderBadge(item.type, `type-${item.type}`)}
          ${item.status ? renderBadge(item.status, `status-${item.status}`) : ''}
        </div>
      </div>
    </div>
  `;
}

export function renderItems(items, viewMode = 'grid') {
  if (items.length === 0) {
    return '<p style="text-align:center;color:var(--text-dim);padding:2rem;">No items found</p>';
  }
  
  const containerClass = viewMode === 'grid' ? 'items-grid' : 'items-list';
  const renderFn = viewMode === 'grid' ? renderCard : renderListRow;
  
  return `<div class="${containerClass}">${items.map(renderFn).join('')}</div>`;
}

export function renderModal(item) {
  if (!item) return '';
  
  const title = item.series 
    ? `${item.series} - S${item.season}E${item.episode}: ${item.title}` 
    : item.title;
  
  const details = [
    item.year && `<strong>Year:</strong> ${item.year}`,
    item.genres && `<strong>Genres:</strong> ${item.genres}`,
    item.tags && `<strong>Tags:</strong> ${item.tags}`,
    item.rating && `<strong>Rating:</strong> ${item.rating}/10 ${renderStars(item.rating)}`,
    item.status && `<strong>Status:</strong> ${item.status}`,
    item.runtime && `<strong>Runtime:</strong> ${item.runtime} min`
  ].filter(Boolean).join('<br>');
  
  return `
    <div class="modal">
      <button class="modal-close" onclick="document.getElementById('itemModal').classList.remove('open')">×</button>
      <div class="modal-header">
        <h2>${title}</h2>
      </div>
      <div class="modal-body">
        <p>${details}</p>
        ${item.summary ? `<p style="margin-top:1rem;">${item.summary}</p>` : ''}
      </div>
      <div class="modal-footer">
        ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener"><button>View on IMDb</button></a>` : ''}
        <button onclick="document.getElementById('itemModal').classList.remove('open')">Close</button>
      </div>
    </div>
  `;
}

export function populateSelect(selectId, options) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  const currentValue = select.value;
  select.innerHTML = '<option value="">All</option>' + 
    options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
  select.value = currentValue;
}
