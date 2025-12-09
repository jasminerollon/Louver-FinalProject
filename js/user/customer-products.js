document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const vendorId = params.get('rid');
  if (!vendorId) {
    alert('No restaurant selected');
    window.location.href = 'customer-homepage.html';
    return;
  }

  const restaurantNameEl = document.getElementById('restaurantName');
  const restaurantDescEl = document.getElementById('restaurantDescription');
  const restaurantImgEl = document.getElementById('restaurantImage');
  const locationEl = document.getElementById('locationDetail');
  const etaEl = document.getElementById('estimatedTime');
  const menuContent = document.getElementById('menuContent');
  const tabs = document.getElementById('categoryTabs');
  const searchInput = document.getElementById('menuSearchInput');

  const modal = document.getElementById('productModal');
  const modalRestName = document.getElementById('modalRestaurantName');
  const modalImg = document.getElementById('modalProductImage');
  const modalName = document.getElementById('modalProductName');
  const modalPrice = document.getElementById('modalProductPrice');
  const modalDesc = document.getElementById('modalProductDescription');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('quantityValue');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const vendorConflictModal = document.getElementById('vendor-conflict-modal');
  const confirmClearCartBtn = document.getElementById('confirmClearCart');
  const addToCartSuccessModal = document.getElementById('addToCartSuccessModal');
  const bodyEl = document.body;

  const cartEl = document.querySelector('.cart');
  const cartBadge = document.querySelector('.cart-count');

  let products = [];
  let menuByCategory = {};
  let currentProduct = null;
  let currentQty = 1;
  let retryAfterClear = false;
  let addBusy = false;

  // Nav cart click
  if (cartEl) {
    cartEl.style.cursor = 'pointer';
    cartEl.addEventListener('click', () => window.location.href = 'customer-cart.html');
  }

  async function updateCartCount() {
    try {
      const res = await fetch('../../database/user/getCartCount.php');
      const data = await res.json();
      const count = data?.count ?? 0;
      if (cartBadge) {
        cartBadge.textContent = count;
        // Show badge only if count > 0
        if (count > 0) {
          cartBadge.style.display = 'block';
        } else {
          cartBadge.style.display = 'none';
        }
      }
    } catch (_) {
      /* noop */
    }
  }

  async function loadVendorMeta() {
    try {
      const res = await fetch('../../database/user/getRestaurants.php');
      const data = await res.json();
      const vendor = Array.isArray(data) ? data.find(v => String(v.vendor_id) === String(vendorId)) : null;
      if (!vendor) return;
      restaurantNameEl.textContent = vendor.business_name || 'Restaurant';
      modalRestName.textContent = vendor.business_name || 'Restaurant';
      restaurantDescEl.textContent = vendor.description || '';
      locationEl.textContent = vendor.address || '—';
      etaEl.textContent = vendor.estimated_time || '10 mins';
      restaurantImgEl.src = `../../assets/pictures/${vendor.profile_image || 'default.png'}`;
      restaurantImgEl.onerror = () => restaurantImgEl.src = '../../assets/pictures/default.png';
    } catch (e) {
      console.error('Vendor meta fetch failed', e);
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch(`../../database/user/getProducts.php?rid=${encodeURIComponent(vendorId)}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(data?.message || 'Failed to load products');
      products = data;
      buildMenu(data);
      renderMenu(menuByCategory);
      renderTabs(menuByCategory);
    } catch (err) {
      console.error(err);
      menuContent.innerHTML = '<p class="no-orders-msg">Failed to load products.</p>';
    }
  }

  function buildMenu(list) {
    menuByCategory = {};
    list.forEach(p => {
      const cat = p.category || 'Popular';
      if (!menuByCategory[cat]) menuByCategory[cat] = [];
      menuByCategory[cat].push(p);
    });
  }

  function renderTabs(menu) {
    tabs.innerHTML = '';
    const cats = Object.keys(menu).sort((a, b) => {
      if (a === 'Popular') return -1;
      if (b === 'Popular') return 1;
      return a.localeCompare(b);
    });
    cats.forEach((cat, idx) => {
      const btn = document.createElement('button');
      btn.className = 'category-tab';
      if (idx === 0) btn.classList.add('active');
      btn.textContent = cat;
      btn.onclick = () => scrollToCategory(cat, btn);
      tabs.appendChild(btn);
    });
  }

  function renderMenu(menu) {
    menuContent.innerHTML = '';
    if (!Object.keys(menu).length) {
      menuContent.innerHTML = '<p class="no-orders-msg">No products found.</p>';
      return;
    }
    const cats = Object.keys(menu).sort((a, b) => {
      if (a === 'Popular') return -1;
      if (b === 'Popular') return 1;
      return a.localeCompare(b);
    });
    cats.forEach(cat => {
      const section = document.createElement('div');
      section.className = 'menu-category';
      section.id = `category-${cat.replace(/\s+/g, '-').toLowerCase()}`;

      const h2 = document.createElement('h2');
      h2.className = 'category-title';
      h2.textContent = cat;
      section.appendChild(h2);

      const grid = document.createElement('div');
      grid.className = 'menu-items';

      menu[cat].forEach(p => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.onclick = () => openProductModal(p);
        const imgPath = p.image ? `../../assets/pictures/businessphotos/${p.image}` : '../../assets/pictures/default-food.png';
        card.innerHTML = `
          <img src="${imgPath}" alt="${p.NAME}" class="menu-item-image" onerror="this.src='../../assets/pictures/default-food.png'">
          <div class="menu-item-info">
            <h3>${p.NAME}</h3>
            <p class="menu-item-price">₱ ${Number(p.price).toFixed(2)}</p>
            <p class="menu-item-desc">${p.description || 'No description available.'}</p>
          </div>
        `;
        grid.appendChild(card);
      });

      section.appendChild(grid);
      menuContent.appendChild(section);
    });
  }

  function scrollToCategory(cat, btn) {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const id = `category-${cat.replace(/\s+/g, '-').toLowerCase()}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openProductModal(p) {
    currentProduct = p;
    currentQty = 1;
    qtyValue.textContent = currentQty;
    modalName.textContent = p.NAME;
    modalDesc.textContent = p.description || 'No description available.';
    modalPrice.textContent = `₱ ${Number(p.price).toFixed(2)}`;
    const imgPath = p.image ? `../../assets/pictures/businessphotos/${p.image}` : '../../assets/pictures/default-food.png';
    modalImg.src = imgPath;
    modalImg.onerror = () => modalImg.src = '../../assets/pictures/default-food.png';
    modal.style.display = 'flex';
  }

  function closeProductModal() {
    modal.style.display = 'none';
    currentProduct = null;
  }
  window.closeProductModal = closeProductModal;

  function changeQty(delta) {
    currentQty = Math.max(1, currentQty + delta);
    qtyValue.textContent = currentQty;
  }

  async function addToCart(showAlerts = true) {
    if (addBusy) return;
    if (!currentProduct) return;
    try {
      addBusy = true;
      addToCartBtn && (addToCartBtn.disabled = true);
      const formData = new FormData();
      formData.append('product_id', currentProduct.product_id);
      formData.append('quantity', currentQty);
      const res = await fetch('../../database/user/addToCart.php', { method: 'POST', body: formData });
      if (!res.ok) {
        throw new Error('Network error');
      }
      const data = await res.json().catch(() => ({}));
      console.log('Add to cart response:', data);
      console.log('data.success:', data?.success);
      
      if (data?.success) {
        if (typeof data.cart_count !== 'undefined' && cartBadge) {
          cartBadge.textContent = data.cart_count;
          // Show badge if count > 0
          if (data.cart_count > 0) {
            cartBadge.style.display = 'block';
          } else {
            cartBadge.style.display = 'none';
          }
        }
        else updateCartCount();
        
        // Close product modal first
        closeProductModal();
        
        // Show success modal - ALWAYS
        console.log('SUCCESS! About to call showSuccessModal');
        console.log('showSuccessModal function exists:', typeof window.showSuccessModal);
        
        // Call it directly without setTimeout
        if (typeof window.showSuccessModal === 'function') {
          window.showSuccessModal();
          console.log('showSuccessModal called!');
        } else {
          console.error('showSuccessModal function not found');
          alert('Toast function not found - but item was added to cart!');
        }
      } else if (data?.code === 'different_vendor' || (data?.message || '').toLowerCase().includes('another restaurant')) {
        retryAfterClear = true;
        showVendorConflict();
      } else {
        // Suppress noisy alerts; log for debugging
        console.warn('Add to cart response', data);
      }
    } catch (e) {
      console.error(e);
      // suppress alert noise; rely on UI badge/cart to reflect state
    } finally {
      addBusy = false;
      addToCartBtn && (addToCartBtn.disabled = false);
    }
  } 

  function showVendorConflict() {
    if (!vendorConflictModal) {
      // Hard fallback if modal markup is missing
      const confirmClear = confirm('Your cart has items from another restaurant. Clear cart to add this item?');
      if (confirmClear) confirmClearCartBtn?.click();
      return;
    }
    vendorConflictModal.style.display = 'flex';
    vendorConflictModal.style.alignItems = 'center';
    vendorConflictModal.style.justifyContent = 'center';
    vendorConflictModal.setAttribute('aria-hidden', 'false');
    bodyEl.classList.add('modal-open');
  }

  function hideVendorConflict() {
    if (!vendorConflictModal) return;
    vendorConflictModal.style.display = 'none';
    vendorConflictModal.setAttribute('aria-hidden', 'true');
    bodyEl.classList.remove('modal-open');
    retryAfterClear = false;
  }
  window.hideVendorConflict = hideVendorConflict;

  qtyMinus?.addEventListener('click', () => changeQty(-1));
  qtyPlus?.addEventListener('click', () => changeQty(1));
  addToCartBtn?.addEventListener('click', addToCart);
  confirmClearCartBtn?.addEventListener('click', async () => {
    try {
      const clr = await fetch('../../database/user/clearCart.php', { method: 'POST' });
      const clrData = await clr.json();
      if (clrData?.success && retryAfterClear) {
        hideVendorConflict();
        addToCart(false); // retry once without alert spam
      } else {
        hideVendorConflict();
      }
    } catch (e) {
      console.error(e);
      hideVendorConflict();
    }
  });

  document.addEventListener('click', e => {
    if (e.target === modal) closeProductModal();
    if (e.target === vendorConflictModal) hideVendorConflict();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeProductModal();
    if (e.key === 'Escape' && vendorConflictModal?.style.display === 'flex') hideVendorConflict();
  });

  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p =>
      (p.NAME || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term)
    );
    buildMenu(filtered);
    renderMenu(menuByCategory);
    renderTabs(menuByCategory);
  });

  loadVendorMeta();
  loadProducts();
  updateCartCount();
});
