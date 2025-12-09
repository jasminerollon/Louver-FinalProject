document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('.orders-table tbody');
  const searchInput = document.querySelector('#orderSearchInput');
  const sortDropdown = document.querySelector('.sort-dropdown');
  const sortMenu = document.querySelector('#sortMenu');
  const sortValueEl = document.querySelector('#sort-value');
  const tabs = Array.from(document.querySelectorAll('.orders-tabs .tab'));

  let allIssues = [];

  function isIssuesActive() {
    const active = document.querySelector('.orders-tabs .tab.active');
    return active && active.textContent.trim().toLowerCase() === 'issues';
  }

  function fetchIssues() {
    return fetch('../../database/admin/getOrderIssues.php')
      .then(res => res.json())
      .then(json => {
        if (json.status !== 'success') throw new Error(json.message || 'Failed');
        allIssues = json.data || [];
        renderIssues(filterAndSort(allIssues));
      })
      .catch(err => {
        console.error('Error loading issues:', err);
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:16px;">Error loading issues</td></tr>`;
      });
  }

  function filterAndSort(rows) {
    const term = (searchInput?.value || '').toLowerCase().trim();
    let filtered = rows;
    if (term) {
      filtered = rows.filter(i =>
        String(i.issue_id).includes(term) ||
        (i.customer || '').toLowerCase().includes(term) ||
        (i.business || '').toLowerCase().includes(term)
      );
    }
    const sorted = [...filtered];
    switch (window.adminSort || 'relevance') {
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
        sorted.sort((a, b) => a.issue_id - b.issue_id);
        break;
      case 'status':
        sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
        break;
      case 'relevance':
      default:
        break;
    }
    return sorted;
  }

  function mapStatusClass(status) {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'pending';
      case 'reviewed': return 'preparing';
      case 'resolved': return 'delivered';
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
    return String(str || '').replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  function renderIssues(issues) {
    if (!tbody) return;
    if (!issues.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:16px;">No issues found</td></tr>`;
      return;
    }
    const rows = issues.map(i => {
      const statusClass = mapStatusClass(i.status);
      const totalFmt = formatCurrency(i.total);
      return `
        <tr>
          <td>${i.issue_id}</td>
          <td>${i.date}</td>
          <td>${escapeHtml(i.customer)}</td>
          <td>${escapeHtml(i.business)}</td>
          <td>${totalFmt}</td>
          <td><span class="status ${statusClass}">${i.status}</span></td>
          <td><button class="view-btn" data-issue-id="${i.issue_id}" title="View issue">View</button></td>
        </tr>`;
    }).join('');
    tbody.innerHTML = rows;

    // Attach view handlers for issues
    tbody.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const issueId = parseInt(btn.getAttribute('data-issue-id'), 10);
        if (!issueId) return;
        openIssueModal(issueId);
      });
    });
  }

  function openIssueModal(issueId) {
    fetch(`../../database/admin/getIssueDetails.php?issue_id=${issueId}`)
      .then(r => r.json())
      .then(j => {
        if (j.status !== 'success') throw new Error(j.message || 'Failed');
        const { issue, order, customer, vendor, items } = j.data;
        const overlay = ensureModalOverlay();
        const modal = buildIssueModal(issue, order, customer, vendor, items);
        // stash current payload for attachment viewers
        modal.setAttribute('data-issue-payload', JSON.stringify({ issue, order }));
        overlay.innerHTML = '';
        overlay.appendChild(modal);
        overlay.classList.add('active');
        overlay.style.display = 'flex';
        document.body.classList.add('modal-open');
      })
      .catch(err => {
        console.error('Failed to load issue details:', err);
        alert('Failed to load issue details.');
      });
  }

  function ensureModalOverlay() {
    let overlay = document.getElementById('issueDetailsOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'issueDetailsOverlay';
      overlay.className = 'order-modal-overlay';
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

  // Basic issue modal layout using existing orders modal styling basis
  function buildIssueModal(issue, order, customer, vendor, items) {
    const wrap = document.createElement('div');
    wrap.className = 'order-modal';
    wrap.style.background = '#fff';
    wrap.style.borderRadius = '16px';
    wrap.style.width = '1040px';
    wrap.style.maxWidth = 'calc(100% - 48px)';
    wrap.style.padding = '20px';

    const header = document.createElement('div');
    header.className = 'order-header';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '12px';
    header.style.position = 'relative';
    const title = document.createElement('h1');
    title.textContent = `Order ${order.order_id}`;
    // Use issue status badge beside order id
    const status = document.createElement('span');
    status.className = `status ${mapStatusClass(issue.status)}`;
    status.textContent = issue.status;
    // Show ordered and reported timestamps
    const orderedOn = document.createElement('p');
    orderedOn.className = 'ordered-date';
    orderedOn.textContent = `Ordered on: ${formatDateTime(order.created_at)}`;
    const reportedOn = document.createElement('p');
    reportedOn.className = 'ordered-date';
    reportedOn.textContent = `Reported on: ${formatDateTime(issue.created_at)}`;
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
    header.appendChild(reportedOn);
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

    // Right: Issue sections
    const right = document.createElement('div');
    right.className = 'order-right';
    right.appendChild(buildRefundReasonSection(issue));
    right.appendChild(buildResolutionSection());

    content.appendChild(left);
    content.appendChild(middle);
    content.appendChild(right);
    wrap.appendChild(content);
    return wrap;
  }

  function buildProfileCard(label, name, contact, email, image, isBuyer, orderNote) {
    const card = document.createElement('div');
    card.className = `profile-card ${isBuyer ? 'buyer-card' : 'owner-card'}`;
    card.style.background = '#fff';
    card.style.borderRadius = '12px';
    card.style.padding = '12px';
    card.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
    const h = document.createElement('h3'); h.className = 'section-title'; h.textContent = label; card.appendChild(h);
    const img = document.createElement('img');
    img.src = `../../assets/pictures/${image}`;
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
    if (isBuyer) {
      const noteWrap = document.createElement('div');
      noteWrap.className = 'order-note';
      noteWrap.style.marginTop = '8px';
      const noteTitle = document.createElement('p');
      noteTitle.style.fontWeight = '600';
      noteTitle.textContent = 'Order Note';
      const noteText = document.createElement('p');
      noteText.style.marginTop = '4px';
      noteText.textContent = orderNote ? String(orderNote) : 'No message attached.';
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

  function buildRefundReasonSection(issue) {
    const sec = document.createElement('div');
    sec.className = 'section items-section';
    sec.style.background = '#EBEBEB';
    sec.style.borderRadius = '12px';
    sec.style.padding = '12px';
    sec.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
    const h = document.createElement('h3'); h.className = 'section-title'; h.innerHTML = '<span class="icon icon-return"></span> Refund Reason'; sec.appendChild(h);
    // First line: issue_reason
    const reason = document.createElement('p');
    reason.style.fontSize = '16px';
    reason.style.fontWeight = '600';
    reason.textContent = issue.reason || '—';
    sec.appendChild(reason);
    // Optional notes: description shown below
    if (issue.description) {
      const notes = document.createElement('p');
      notes.style.marginTop = '6px';
      notes.style.color = '#7a5252';
      notes.style.fontStyle = 'italic';
      notes.textContent = issue.description;
      sec.appendChild(notes);
    }
    // Customer attached photos always present
    const custPhotosRow = document.createElement('div');
    custPhotosRow.style.display = 'flex';
    custPhotosRow.style.alignItems = 'center';
    custPhotosRow.style.justifyContent = 'space-between';
    custPhotosRow.style.marginTop = '10px';
    const custPhotosLabel = document.createElement('strong');
    custPhotosLabel.textContent = 'Attached Photos';
    const custViewBtn = document.createElement('button');
    custViewBtn.className = 'view-btn';
    custViewBtn.textContent = 'View';
    custViewBtn.dataset.role = 'customer-proof';
    custViewBtn.dataset.filename = issue.customer_proof || '';
    custPhotosRow.appendChild(custPhotosLabel);
    custPhotosRow.appendChild(custViewBtn);
    sec.appendChild(custPhotosRow);
    // Add a divider line after customer attached photos for clarity
    const divider = document.createElement('hr');
    divider.className = 'section-divider';
    sec.appendChild(divider);
    const decision = document.createElement('div');
    decision.style.marginTop = '8px';
    // Make business decision more noticeable
    const decisionLabel = document.createElement('span');
    decisionLabel.style.display = 'inline-block';
    decisionLabel.style.fontWeight = '800';
    decisionLabel.style.marginRight = '8px';
    decisionLabel.textContent = 'Business Decision';
    const decisionBadge = document.createElement('span');
    const vd = (issue.vendor_decision || 'Pending').toLowerCase();
    const vdClass = vd.includes('approve') ? 'delivered' : (vd.includes('decline') ? 'failed' : 'preparing');
    decisionBadge.className = `status ${vdClass}`;
    decisionBadge.style.display = 'inline-block';
    decisionBadge.style.padding = '6px 12px';
    decisionBadge.style.borderRadius = '999px';
    decisionBadge.style.fontWeight = '700';
    decisionBadge.textContent = issue.vendor_decision || 'Pending';
    decision.appendChild(decisionLabel);
    decision.appendChild(decisionBadge);
    sec.appendChild(decision);
    // Vendor feedback under decision (if any)
    if (issue.vendor_decision && issue.vendor_decision.toLowerCase() !== 'pending' && issue.vendor_feedback) {
      const vfb = document.createElement('p');
      vfb.style.marginTop = '6px';
      vfb.style.color = '#7a5252';
      vfb.style.fontStyle = 'italic';
      vfb.textContent = issue.vendor_feedback;
      sec.appendChild(vfb);
      // Vendor attached photos row
      const vendPhotosRow = document.createElement('div');
      vendPhotosRow.style.display = 'flex';
      vendPhotosRow.style.alignItems = 'center';
      vendPhotosRow.style.justifyContent = 'space-between';
      vendPhotosRow.style.marginTop = '10px';
      const vendPhotosLabel = document.createElement('strong');
      vendPhotosLabel.textContent = 'Attached Photos';
      const vendViewBtn = document.createElement('button');
      vendViewBtn.className = 'view-btn';
      vendViewBtn.textContent = 'View';
      vendViewBtn.dataset.role = 'vendor-proof';
      vendViewBtn.dataset.filename = issue.vendor_proof || '';
      vendPhotosRow.appendChild(vendPhotosLabel);
      vendPhotosRow.appendChild(vendViewBtn);
      sec.appendChild(vendPhotosRow);
    }
    return sec;
  }

  function buildResolutionSection() {
    const sec = document.createElement('div');
    sec.className = 'section delivery-section resolution-section';
    const h = document.createElement('h3'); h.className = 'section-title'; h.innerHTML = '<span class="icon icon-tools"></span> Resolution'; sec.appendChild(h);

    // Layout: left column = options + notes, right column = stacked buttons
    const grid = document.createElement('div');
    grid.className = 'resolution-grid';

    const leftCol = document.createElement('div');
    leftCol.className = 'resolution-left';
    const radios = document.createElement('div');
    radios.className = 'resolution-options';
    radios.innerHTML = `
      <label><input type="radio" name="resolution" value="approve"> Approve Refund</label><br/>
      <label><input type="radio" name="resolution" value="decline"> Decline Refund</label>
    `;
    const notes = document.createElement('textarea');
    notes.className = 'resolution-notes';
    notes.placeholder = 'Additional Notes';
    leftCol.appendChild(radios);
    leftCol.appendChild(notes);

    const rightCol = document.createElement('div');
    rightCol.className = 'resolution-right';
    rightCol.innerHTML = `
      <button class="action-btn btn-view">VIEW ORDER DETAILS</button>
      <button class="action-btn btn-under-review">MARK UNDER REVIEW</button>
      <button class="action-btn btn-resolved">MARK RESOLVED</button>
    `;

    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    sec.appendChild(grid);

    // Confirm spans full width under grid
    const confirm = document.createElement('button');
    confirm.className = 'action-btn btn-confirm';
    confirm.textContent = 'CONFIRM DECISION';
    sec.appendChild(confirm);
    return sec;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('issueDetailsOverlay');
      if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        document.body.classList.remove('modal-open');
      }
    }
  });

  // Event wiring only active on Issues tab
  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (!isIssuesActive()) return; // Only act when issues tab becomes active
        // keep shared sort label; do not reset
        if (searchInput) searchInput.value = '';
        fetchIssues();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (!isIssuesActive()) return;
      renderIssues(filterAndSort(allIssues));
    });
  }

  // Shared sort handled by admin-shared-sort.js; respond to event
  document.addEventListener('admin-sort-changed', () => {
    if (isIssuesActive()) {
      renderIssues(filterAndSort(allIssues));
    }
  });

  // Attachments modal utilities
  function ensureAttachmentsOverlay() {
    let overlay = document.getElementById('attachmentsOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'attachmentsOverlay';
      overlay.className = 'order-modal-overlay';
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

  function openAttachmentsModal(role, filename) {
    if (!filename) return;
    const base = role === 'vendor-proof' ? '../../assets/uploads/vendor_proofs/' : '../../assets/uploads/customer_proofs/';
    const src = base + filename;
    const overlay = ensureAttachmentsOverlay();
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.style.maxWidth = '860px';
    modal.style.width = 'calc(100% - 48px)';
    modal.style.height = 'auto';
    modal.style.padding = '16px';
    const header = document.createElement('div');
    header.className = 'order-header';
    header.style.position = 'relative';
    const h1 = document.createElement('h1');
    h1.textContent = role === 'vendor-proof' ? 'Vendor Attachment' : 'Customer Attachment';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '8px';
    closeBtn.style.top = '8px';
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
      document.body.classList.remove('modal-open');
    });
    header.appendChild(h1);
    header.appendChild(closeBtn);
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Attachment';
    img.style.width = '100%';
    img.style.maxHeight = '70vh';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '12px';
    const body = document.createElement('div');
    body.className = 'order-content';
    body.style.display = 'block';
    body.appendChild(img);
    modal.appendChild(header);
    modal.appendChild(body);
    overlay.innerHTML = '';
    overlay.appendChild(modal);
    overlay.classList.add('active');
    overlay.style.display = 'flex';
    document.body.classList.add('modal-open');
  }

  // Global click handler for View buttons inside the issue modal
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;
    const role = btn.dataset.role;
    const filename = btn.dataset.filename;
    if (!role) return;
    openAttachmentsModal(role, filename);
  });

  // Local date-time formatter (same as orders modal)
  function formatDateTime(dt) {
    const d = new Date(dt);
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const tOpts = { hour: 'numeric', minute: '2-digit' };
    return `${d.toLocaleDateString(undefined, opts)} | ${d.toLocaleTimeString(undefined, tOpts)}`;
  }
});