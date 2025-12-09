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
    card.dataset.vendorId = biz.vendor_id;

    const statusClass = (biz.session_status || '').toLowerCase(); // 'online' or 'offline'

    const imgSrc = biz.profile_image
      ? `../../assets/pictures/${biz.profile_image}`
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

    // Open modal with products when clicking a card
    card.addEventListener('click', () => openProductsModal(biz));
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

// ================= Products Modal ==================
function openProductsModal(biz) {
  let overlay = document.getElementById('bizProductsOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'bizProductsOverlay';
    overlay.className = 'biz-modal-overlay';
    overlay.innerHTML = `
      <div class="biz-modal">
        <button class="biz-close" aria-label="Close">&times;</button>
        <div class="biz-header">
          <div class="biz-header-left">
            <div class="avatar avatar-lg"><img src="" alt="Business Logo" onerror="this.src='../../assets/pictures/logo.png'"/></div>
            <div class="biz-title-wrap">
              <h2 class="biz-title"></h2>
              <div class="biz-subtitle"></div>
            </div>
          </div>
          <button class="remove-store-btn" type="button">Remove Store</button>
        </div>
        <div class="biz-table">
          <div class="biz-table-head">
            <div class="col-name">Products</div>
            <div class="col-price">Price</div>
            <div class="col-action">Action</div>
          </div>
          <div class="biz-table-body" id="bizProductsBody"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    // Close interactions
    overlay.querySelector('.biz-close').addEventListener('click', () => hideBizModal());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) hideBizModal(); });
    document.addEventListener('keydown', escCloseHandler);
  }

  const avatarImg = overlay.querySelector('.avatar-lg img');
  avatarImg.src = biz.profile_image ? `../../assets/pictures/${biz.profile_image}` : '../../assets/pictures/logo.png';
  overlay.querySelector('.biz-title').textContent = biz.business_name || '';
  overlay.querySelector('.biz-subtitle').textContent = biz.owner_name || '';

  const removeStoreBtn = overlay.querySelector('.remove-store-btn');
  if (removeStoreBtn) {
    removeStoreBtn.onclick = () => openRemoveBusinessModal(biz);
  }

  overlay.classList.add('active');

  // Fetch products for selected vendor
  fetch(`../../database/admin/getVendorProducts.php?vendor_id=${encodeURIComponent(biz.vendor_id)}`)
    .then(r => r.json())
    .then(data => {
      const body = overlay.querySelector('#bizProductsBody');
      body.innerHTML = '';
      if (!data || !data.success || !Array.isArray(data.products) || data.products.length === 0) {
        body.innerHTML = `<div class="empty-products">No products found.</div>`;
        return;
      }

      data.products.forEach(p => {
        const row = document.createElement('div');
        row.className = 'biz-row';
        const imgSubPath = (p.image || '').includes('/') ? (p.image || '') : `${biz.vendor_id}/${p.image || ''}`;
        const imgPath = (p.image)
          ? `../../assets/pictures/businessphotos/${imgSubPath}`
          : '../../assets/pictures/logo.png';
        row.innerHTML = `
          <div class="col-name">
            <div class="prod-item">
              <div class="prod-img"><img src="${imgPath}" alt="${p.NAME || p.name || 'Product'}" onerror="this.src='../../assets/pictures/logo.png'"/></div>
              <div class="prod-text">
                <div class="prod-title">${p.NAME || p.name || ''}</div>
                <div class="prod-desc">${p.description || ''}</div>
              </div>
            </div>
          </div>
          <div class="col-price">₱${Number(p.price || 0).toLocaleString('en-PH')}</div>
          <div class="col-action"><button class="remove-item-btn" type="button" data-product-id="${p.product_id}">Remove</button></div>
        `;
        const removeBtn = row.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openRemoveProductModal({
            vendor_id: biz.vendor_id,
            product_id: p.product_id,
            name: p.NAME || p.name || 'Product'
          });
        });
        body.appendChild(row);
      });
    })
    .catch(() => {
      const body = overlay.querySelector('#bizProductsBody');
      body.innerHTML = `<div class="empty-products">Failed to load products.</div>`;
    });
}

function hideBizModal() {
  const overlay = document.getElementById('bizProductsOverlay');
  if (overlay) overlay.classList.remove('active');
}

function escCloseHandler(e) {
  if (e.key === 'Escape') hideBizModal();
}

// =============== Remove Product Modal ===============
function openRemoveProductModal({ vendor_id, product_id, name }) {
  let overlay = document.getElementById('removeProductOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'removeProductOverlay';
    overlay.className = 'report-modal-overlay';
    overlay.innerHTML = `
      <div class="report-modal">
        <button class="report-close-btn" aria-label="Close">&times;</button>
        <h2 class="report-title">Remove Product</h2>
        <p style="text-align:center; color:#760101; margin-bottom: 12px;">Are you sure you want to remove this product?<br/>This action cannot be undone.</p>
        <div class="report-section">
          <label for="removeReason">Reason of deletion</label>
          <textarea id="removeReason" placeholder="Type your reason..." required></textarea>
        </div>
        <div class="report-buttons">
          <button class="cancel-report" type="button">Cancel</button>
          <button class="confirm-report" type="button">Remove</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  overlay.classList.add('active');

  const closeBtn = overlay.querySelector('.report-close-btn');
  const cancelBtn = overlay.querySelector('.cancel-report');
  const confirmBtn = overlay.querySelector('.confirm-report');
  const reasonEl = overlay.querySelector('#removeReason');

  const closeOverlay = () => { overlay.classList.remove('active'); reasonEl.value = ''; };
  closeBtn.onclick = closeOverlay;
  cancelBtn.onclick = closeOverlay;
  overlay.onclick = (e) => { if (e.target === overlay) closeOverlay(); };

  confirmBtn.onclick = () => {
    const reason = (reasonEl.value || '').trim();
    if (!reason) {
      reasonEl.focus();
      reasonEl.style.outline = '2px solid #b20808';
      setTimeout(() => { reasonEl.style.outline = 'none'; }, 1200);
      return;
    }
    // Call delete API
    fetch('../../database/admin/deleteProduct.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id, product_id, reason })
    })
    .then(r => r.json())
    .then(res => {
      if (res && res.success) {
        // Refresh current products listing in the modal
        const bizOverlay = document.getElementById('bizProductsOverlay');
        if (bizOverlay && bizOverlay.classList.contains('active')) {
          // find title to get vendor_id again
          // re-fetch products for this vendor
          fetch(`../../database/admin/getVendorProducts.php?vendor_id=${encodeURIComponent(vendor_id)}`)
            .then(r => r.json())
            .then(data => {
              const body = bizOverlay.querySelector('#bizProductsBody');
              body.innerHTML = '';
              if (!data || !data.success || !Array.isArray(data.products) || data.products.length === 0) {
                body.innerHTML = `<div class="empty-products">No products found.</div>`;
              } else {
                data.products.forEach(p => {
                  const row = document.createElement('div');
                  row.className = 'biz-row';
                  const sub = (p.image || '').includes('/') ? (p.image || '') : `${vendor_id}/${p.image || ''}`;
                  const imgPath = p.image ? `../../assets/pictures/businessphotos/${sub}` : '../../assets/pictures/logo.png';
                  row.innerHTML = `
                    <div class="col-name">
                      <div class="prod-item">
                        <div class="prod-img"><img src="${imgPath}" alt="${p.NAME || p.name || 'Product'}" onerror="this.src='../../assets/pictures/logo.png'"/></div>
                        <div class="prod-text">
                          <div class="prod-title">${p.NAME || p.name || ''}</div>
                          <div class="prod-desc">${p.description || ''}</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-price">₱${Number(p.price || 0).toLocaleString('en-PH')}</div>
                    <div class="col-action"><button class="remove-item-btn" type="button" data-product-id="${p.product_id}">Remove</button></div>
                  `;
                  const removeBtn = row.querySelector('.remove-item-btn');
                  removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openRemoveProductModal({ vendor_id, product_id: p.product_id, name: p.NAME || p.name || 'Product' });
                  });
                  body.appendChild(row);
                });
              }
            });
        }
        closeOverlay();
      } else {
        showToast(res && res.message ? res.message : 'Failed to remove product', 'error');
      }
    })
    .catch(() => showToast('Error removing product', 'error'));
  };
}

// =============== Remove Business Modal ===============
function openRemoveBusinessModal(biz) {
  let overlay = document.getElementById('removeBusinessOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'removeBusinessOverlay';
    overlay.className = 'report-modal-overlay';
    overlay.innerHTML = `
      <div class="report-modal">
        <button class="report-close-btn" aria-label="Close">&times;</button>
        <h2 class="report-title">Remove Business</h2>
        <p style="text-align:center; color:#760101; margin-bottom: 12px;">Are you sure you want to remove <b class="biz-name-inline"></b>?<br/>This action cannot be undone.</p>
        <div class="report-section">
          <label for="removeBusinessReason">Reason of deletion</label>
          <textarea id="removeBusinessReason" placeholder="Type your reason..." required></textarea>
        </div>
        <div class="report-buttons">
          <button class="cancel-report" type="button">Cancel</button>
          <button class="confirm-report" type="button">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  overlay.classList.add('active');
  const inlineName = overlay.querySelector('.biz-name-inline');
  if (inlineName) inlineName.textContent = biz.business_name || 'this business';

  const closeBtn = overlay.querySelector('.report-close-btn');
  const cancelBtn = overlay.querySelector('.cancel-report');
  const confirmBtn = overlay.querySelector('.confirm-report');
  const reasonEl = overlay.querySelector('#removeBusinessReason');

  const closeOverlay = () => { overlay.classList.remove('active'); reasonEl.value = ''; };
  closeBtn.onclick = closeOverlay;
  cancelBtn.onclick = closeOverlay;
  overlay.onclick = (e) => { if (e.target === overlay) closeOverlay(); };

  confirmBtn.onclick = () => {
    const reason = (reasonEl.value || '').trim();
    if (!reason) {
      reasonEl.focus();
      reasonEl.style.outline = '2px solid #b20808';
      setTimeout(() => { reasonEl.style.outline = 'none'; }, 1200);
      return;
    }

    fetch('../../database/admin/deleteBusiness.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id: biz.vendor_id, reason })
    })
    .then(r => r.json())
    .then(res => {
      if (res && res.success) {
        // Close both overlays and refresh list
        closeOverlay();
        hideBizModal();
        fetchBusinesses();
      } else {
        showToast(res && res.message ? res.message : 'Failed to remove business', 'error');
      }
    })
    .catch(() => showToast('Error removing business', 'error'));
  };
}

// ===== Simple toast notifications =====
function showToast(message, variant = 'error') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${variant}`;
  toast.textContent = message;
  container.appendChild(toast);
  const ttl = 3500;
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    setTimeout(() => toast.remove(), 180);
  }, ttl);
}
