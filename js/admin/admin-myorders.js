document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('.orders-table tbody');
    const dateLabel = document.querySelector('.date-label'); // Keep existing line for context
    const searchInput = document.querySelector('#orderSearchInput');
    const sortDropdown = document.querySelector('.sort-dropdown');
    const sortMenu = document.querySelector('#sortMenu');
    const sortValueEl = document.querySelector('#sort-value');
    const tabs = Array.from(document.querySelectorAll('.orders-tabs .tab'));
    let allOrders = [];
    window.adminView = 'orders';
    window.adminSort = 'relevance';

  // Update date label similar to applications page
  const now = new Date();
  const opts = { month: 'long', day: 'numeric', year: 'numeric' };
  const timeOpts = { hour: '2-digit', minute: '2-digit' };
  const formatted = `${now.toLocaleDateString(undefined, opts)} | ${now.toLocaleTimeString(undefined, timeOpts)}`;
  if (dateLabel) dateLabel.textContent = formatted;

  // Initial fetch orders
  fetch('../../database/admin/getOrders.php')
    .then(res => res.json())
    .then(json => {
      if (json.status !== 'success') throw new Error(json.message || 'Failed');
        allOrders = json.data || [];
        renderOrders(filterAndSort(allOrders));
    })
    .catch(err => {
      console.error('Error loading orders:', err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:16px;">Error loading orders</td></tr>`;
      }
    });

  // Issues logic moved to js/admin/admin-issues.js

    // Search
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (currentView === 'orders') {
          renderOrders(filterAndSort(allOrders));
        }
      });
    }

    // Sort dropdown interactions
    // Shared sort handled by admin-shared-sort.js; respond to event
    document.addEventListener('admin-sort-changed', () => {
      if (window.adminView === 'orders') {
        renderOrders(filterAndSort(allOrders));
      }
    });

    // Tabs: switch between Orders and Issues
    if (tabs.length) {
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const isIssues = tab.textContent.trim().toLowerCase() === 'issues';
          window.adminView = isIssues ? 'issues' : 'orders';
          // keep current sort selection across tabs
          if (searchInput) searchInput.value = '';
          if (!isIssues) {
            renderOrders(filterAndSort(allOrders));
          }
        });
      });
    }

  function renderOrders(orders) {
    if (!tbody) return;
    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:16px;">No orders found</td></tr>`;
      return;
    }

    const rows = orders.map(o => {
      const statusClass = mapStatusClass(o.status);
      const totalFmt = formatCurrency(o.total);
      return `
        <tr>
          <td>${o.order_id}</td>
          <td>${o.date}</td>
          <td>${escapeHtml(o.customer)}</td>
          <td>${escapeHtml(o.business)}</td>
          <td>${totalFmt}</td>
          <td><span class="status ${statusClass}">${o.status}</span></td>
          <td><button class="view-btn" data-order-id="${o.order_id}">View</button></td>
        </tr>`;
    }).join('');

    tbody.innerHTML = rows;

    // Attach view handlers
    tbody.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-order-id');
        if (!orderId) return;
        openOrderModal(parseInt(orderId, 10));
      });
    });
  }

    function filterAndSort(rows) {
      const term = (searchInput?.value || '').toLowerCase().trim();
      let filtered = rows;
      if (term) {
        filtered = rows.filter(o =>
          String(o.order_id).includes(term) ||
          (o.customer || '').toLowerCase().includes(term) ||
          (o.business || '').toLowerCase().includes(term)
        );
      }
      const sorted = [...filtered];
      switch (window.adminSort) {
        case 'time':
          sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          break;
        case 'date':
          sorted.sort((a, b) => new Date(b.date.split('|')[0]).getTime() - new Date(a.date.split('|')[0]).getTime());
          break;
        case 'business':
          sorted.sort((a, b) => (a.business || '').localeCompare(b.business || ''));
          break;
        case 'id':
          sorted.sort((a, b) => a.order_id - b.order_id);
          break;
        case 'status':
          sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
          break;
        case 'relevance':
        default:
          // Leave as fetched order (by created_at desc)
          break;
      }
      return sorted;
    }

  function mapStatusClass(status) {
    switch ((status || '').toLowerCase()) {
      case 'preparing': return 'preparing';
      case 'ready': return 'pending';
      case 'delivered': return 'delivered';
      case 'rejected': return 'failed';
      default: return 'pending';
    }
  }

  function formatCurrency(value) {
    try {
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value).replace('PHP', '₱');
    } catch {
      return `₱ ${value}`;
    }
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  function openOrderModal(orderId) {
    fetch(`../../database/admin/getOrderDetails.php?order_id=${orderId}`)
      .then(r => r.json())
      .then(j => {
        if (j.status !== 'success') throw new Error(j.message || 'Failed');
        const { order, customer, vendor, items } = j.data;
        const overlay = ensureModalOverlay();
        const modal = buildModal(order, customer, vendor, items);
        overlay.innerHTML = '';
        overlay.appendChild(modal);
        overlay.classList.add('active');
        // Ensure overlay is visible regardless of external CSS
        overlay.style.display = 'flex';
        document.body.classList.add('modal-open');
      })
      .catch(err => {
        console.error('Failed to load order details:', err);
        alert('Failed to load order details.');
      });
  }

  function ensureModalOverlay() {
    let overlay = document.getElementById('orderDetailsOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'orderDetailsOverlay';
      overlay.className = 'order-modal-overlay';
      // Defensive inline styles to avoid global CSS conflicts
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.background = 'rgba(0,0,0,0.35)';
      overlay.style.display = 'none';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '9999';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          overlay.style.display = 'none';
          document.body.classList.remove('modal-open');
        }
      });
    }
    return overlay;
  }

  function buildModal(order, customer, vendor, items) {
    const wrap = document.createElement('div');
    wrap.className = 'order-modal';
    // Defensive inline styles for the modal container
    wrap.style.background = '#fff';
    wrap.style.borderRadius = '16px';
    wrap.style.width = '960px';
    wrap.style.maxWidth = 'calc(100% - 48px)';
    wrap.style.padding = '20px';

    // Header
    const header = document.createElement('div');
    header.className = 'order-header';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '12px';
    header.style.position = 'relative';
    const title = document.createElement('h1');
    title.textContent = `Order ${order.order_id}`;
    const status = document.createElement('span');
    status.className = `status ${mapStatusClass(order.order_status)}`;
    status.textContent = order.order_status;
    const orderedOn = document.createElement('p');
    orderedOn.className = 'ordered-date';
    orderedOn.textContent = `Ordered on: ${formatDateTime(order.created_at)}`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '8px';
    closeBtn.style.top = '8px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', () => {
      const parent = wrap.parentElement;
      if (parent) {
        parent.classList.remove('active');
        parent.style.display = 'none';
      }
      document.body.classList.remove('modal-open');
    });
    header.appendChild(title);
    header.appendChild(status);
    header.appendChild(orderedOn);
    header.appendChild(closeBtn);
    wrap.appendChild(header);

    const content = document.createElement('div');
    content.className = 'order-content';
    content.style.display = 'grid';
    content.style.gridTemplateColumns = '1fr 1fr 2fr';
    content.style.gap = '16px';
    content.style.marginTop = '12px';

    // Left: Buyer
    const left = document.createElement('div');
    left.className = 'order-left';
    left.appendChild(buildProfileCard('BUYER', customer.name, customer.contact, customer.email, customer.image, true, order.customer_note));

    // Middle: Owner
    const middle = document.createElement('div');
    middle.className = 'order-middle';
    middle.appendChild(buildProfileCard('OWNER', vendor.name, vendor.contact, vendor.email, vendor.image, false));

    // Right: Items + Summary + Delivery (scrollable)
    const right = document.createElement('div');
    right.className = 'order-right';
    right.appendChild(buildItemsSection(items));
    right.appendChild(buildSummarySection(items, order.delivery_fee, order.total_price));
    right.appendChild(buildDeliverySection(order.delivery_address, order.created_at, order.order_status));

    content.appendChild(left);
    content.appendChild(middle);
    content.appendChild(right);
    wrap.appendChild(content);
    return wrap;
  }

  // Close modal on Escape key for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('orderDetailsOverlay');
      if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        document.body.classList.remove('modal-open');
      }
    }
  });

  function buildProfileCard(label, name, contact, email, image, isBuyer, orderNote) {
    const card = document.createElement('div');
    card.className = `profile-card ${isBuyer ? 'buyer-card' : 'owner-card'}`;
    card.style.background = '#fff';
    card.style.borderRadius = '12px';
    card.style.padding = '12px';
    card.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
    const h = document.createElement('h3'); h.className = 'section-title'; h.textContent = label; card.appendChild(h);
    const img = document.createElement('img');
    const base = isBuyer ? '../../assets/pictures/' : '../../assets/pictures/';
    img.src = `${base}${image}`;
    img.alt = label;
    img.className = 'avatar-img';
    img.style.width = '96px';
    img.style.height = '96px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    card.appendChild(img);
    const bn = document.createElement('p'); bn.className = 'profile-name'; bn.textContent = name; card.appendChild(bn);
    const info = document.createElement('div'); info.className = 'contact-info';
    info.innerHTML = `
      <p class="contact-title"><strong>Contact Info</strong></p>
      <p class="contact-line"><span class="icon icon-phone"></span> ${escapeHtml(contact || '')}</p>
      <p class="contact-line"><span class="icon icon-envelope"></span> ${escapeHtml(email || '')}</p>`;
    card.appendChild(info);

    // Order note shown under buyer info
    if (isBuyer) {
      const noteWrap = document.createElement('div');
      noteWrap.className = 'order-note';
      noteWrap.style.marginTop = '8px';
      const noteTitle = document.createElement('p');
      noteTitle.style.fontWeight = '600';
      noteTitle.textContent = 'Order Note';
      const noteText = document.createElement('p');
      noteText.style.marginTop = '4px';
      noteText.textContent = orderNote ? String(orderNote) : '—';
      noteWrap.appendChild(noteTitle);
      noteWrap.appendChild(noteText);
      card.appendChild(noteWrap);
    }

    const btn = document.createElement('button');
    btn.className = 'contact-btn';
    btn.textContent = isBuyer ? 'CONTACT USER' : 'CONTACT OWNER';
    card.appendChild(btn);
    return card;
  }

  function buildItemsSection(items) {
    const sec = document.createElement('div');
    sec.className = 'section items-section';
    sec.style.background = '#EBEBEB';
    sec.style.borderRadius = '12px';
    sec.style.padding = '12px';
    sec.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
    sec.style.marginTop = '10px';
    const h = document.createElement('h3'); h.className = 'section-title'; h.innerHTML = '<span class="icon icon-list"></span> Items'; sec.appendChild(h);
    items.forEach(it => {
      const row = document.createElement('div'); row.className = 'item-row';
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.padding = '10px 12px';
      row.style.margin = '8px 0';
      row.style.background = '#EBEBEB';
      row.style.borderRadius = '10px';
      row.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
      const left = document.createElement('span'); left.innerHTML = `<strong>${it.quantity}x</strong> ${escapeHtml(it.name)}`;
      const right = document.createElement('span'); right.textContent = formatCurrency(it.price * it.quantity);
      row.appendChild(left); row.appendChild(right);
      sec.appendChild(row);
    });
    return sec;
  }

  function buildSummarySection(items, deliveryFee, total) {
    const sec = document.createElement('div'); sec.className = 'section summary-section';
    sec.style.background = '#fff';
    sec.style.borderRadius = '12px';
    sec.style.padding = '12px';
    sec.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
    sec.style.marginTop = '10px';
    const h = document.createElement('h3'); h.className = 'section-title'; h.innerHTML = '<span class="icon icon-money"></span> Payment Summary'; sec.appendChild(h);
    const subtotal = items.reduce((s, it) => s + (it.price * it.quantity), 0);
    sec.innerHTML += `
      <div class="summary-row"><span>Subtotal (${items.length} items)</span><span class="amount">${formatCurrency(subtotal)}</span></div>
      <div class="summary-row"><span>Delivery</span><span class="amount">${formatCurrency(deliveryFee || 0)}</span></div>
      <hr />
      <div class="summary-row total"><span>TOTAL</span><span class="amount">${formatCurrency(total)}</span></div>`;
    return sec;
  }

  function buildDeliverySection(address, createdAt, status) {
    const sec = document.createElement('div'); sec.className = 'section delivery-section';
    sec.style.background = '#8B0000';
    sec.style.color = '#fff';
    sec.style.borderRadius = '12px';
    sec.style.padding = '12px';
    sec.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
    sec.style.marginTop = '10px';
    const h = document.createElement('h3'); h.className = 'section-title'; h.innerHTML = '<span class="icon icon-truck"></span> Delivery Information'; sec.appendChild(h);
    const dateOnly = formatDate(createdAt);
    sec.innerHTML += `
      <p class="delivery-line"><span class="icon icon-box"></span> <strong>Standard Delivery</strong></p>
      <p class="delivery-line"><span class="icon icon-location"></span> Location: ${escapeHtml(address || 'N/A')}</p>
      <p class="delivery-line"><span class="icon icon-calendar"></span> Date: ${dateOnly}</p>
      <p class="delivery-line"><span class="icon icon-clock"></span> Time: ${status === 'Delivered' ? 'Completed' : 'Pending'}</p>`;
    return sec;
  }

  function formatDateTime(dt) {
    const d = new Date(dt);
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const tOpts = { hour: 'numeric', minute: '2-digit' };
    return `${d.toLocaleDateString(undefined, opts)} | ${d.toLocaleTimeString(undefined, tOpts)}`;
  }
  function formatDate(dt) {
    const d = new Date(dt);
    const opts = { month: 'long', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString(undefined, opts);
  }
});