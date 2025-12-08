document.addEventListener('DOMContentLoaded', function() {
  // Real-time date/time update
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // Fetch and render businesses
  fetchBusinesses();

  // Sort dropdown toggle and options
  const sortBtn = document.querySelector('.sort-btn');
  const sortMenu = document.getElementById('sortMenu');
  const sortLabelEl = document.querySelector('.sort-label');

  if (sortBtn) {
    sortBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (sortMenu) sortMenu.classList.toggle('active');
    });
  }

  if (sortMenu) {
    // Prevent clicks inside menu from bubbling to document
    sortMenu.addEventListener('click', function(e) { e.stopPropagation(); });
    const sortItems = sortMenu.querySelectorAll('p[data-sort]');
    sortItems.forEach(item => {
      item.addEventListener('click', function() {
        const sortType = this.getAttribute('data-sort');
        if (sortLabelEl) sortLabelEl.textContent = this.textContent;
        sortMenu.classList.remove('active');
        sortBusinesses(sortType);
      });
    });
  }

  // Search functionality
  const searchInput = document.getElementById('businessSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', function() {
      filterBusinesses(this.value);
    });
  }

  // Close sort menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.sort-dropdown')) {
      if (sortMenu) sortMenu.classList.remove('active');
    }
  });
});

let allBusinesses = [];

function updateDateTime() {
  const now = new Date();
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const dateString = now.toLocaleDateString('en-US', options);
  const el = document.getElementById('currentDate');
  if (el) el.textContent = dateString;
}

function fetchBusinesses() {
  fetch('../../database/admin/getBusinesses.php')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'success') {
        allBusinesses = data.data;
        renderBusinesses(allBusinesses);
      } else {
        console.error('Error:', data.message);
        renderEmptyState('No businesses found');
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      renderEmptyState('Error loading businesses');
    });
}

function renderBusinesses(businesses) {
  const grid = document.getElementById('businessCardsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!businesses || businesses.length === 0) {
    renderEmptyState('No businesses found');
    return;
  }

  businesses.forEach(biz => {
    const card = document.createElement('div');
    card.className = 'business-card';

    const statusClass = (biz.session_status || '').toLowerCase(); // 'online' or 'offline'

    const imgSrc = biz.profile_image
      ? `../../assets/pictures/businessphotos/${biz.profile_image}`
      : '../../assets/pictures/logo.png';

    card.innerHTML = `
      <div class="card-left">
        <div class="avatar">
          <img src="${imgSrc}" alt="${biz.business_name} Logo" onerror="this.src='../../assets/pictures/logo.png'" />
        </div>
      </div>
      <div class="card-middle">
        <h2 class="business-name">${biz.business_name}</h2>
        <p class="owner-name">${biz.owner_name || ''}</p>
      </div>
      <div class="card-right">
        <span class="status ${statusClass}">${biz.session_status}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

function filterBusinesses(term) {
  const t = (term || '').toLowerCase();
  const filtered = allBusinesses.filter(biz =>
    (biz.business_name || '').toLowerCase().includes(t) ||
    (biz.owner_name || '').toLowerCase().includes(t)
  );
  renderBusinesses(filtered);
}

function sortBusinesses(sortType) {
  let sorted = [...allBusinesses];

  switch (sortType) {
    case 'status-online-first':
      sorted.sort((a, b) => {
        const sa = (a.session_status || '').toLowerCase();
        const sb = (b.session_status || '').toLowerCase();
        // online comes before offline
        if (sa === sb) return 0;
        if (sa === 'online') return -1;
        if (sb === 'online') return 1;
        return 0;
      });
      break;
    case 'status-offline-first':
      sorted.sort((a, b) => {
        const sa = (a.session_status || '').toLowerCase();
        const sb = (b.session_status || '').toLowerCase();
        // offline comes before online
        if (sa === sb) return 0;
        if (sa === 'offline') return -1;
        if (sb === 'offline') return 1;
        return 0;
      });
      break;
    case 'name-asc':
      sorted.sort((a, b) => (a.business_name || '').localeCompare(b.business_name || ''));
      break;
    case 'name-desc':
      sorted.sort((a, b) => (b.business_name || '').localeCompare(a.business_name || ''));
      break;
    case 'relevance':
    default:
      sorted = allBusinesses;
  }

  renderBusinesses(sorted);
}

function renderEmptyState(message) {
  const grid = document.getElementById('businessCardsGrid');
  if (!grid) return;
  grid.innerHTML = `<div style="width:100%; text-align:center; color:#999; padding:40px;">${message}</div>`;
}
