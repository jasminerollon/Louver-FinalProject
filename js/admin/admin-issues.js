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
          <td><button class="view-btn" disabled title="Different modal will be implemented"><i class="fa fa-eye"></i> View</button></td>
        </tr>`;
    }).join('');
    tbody.innerHTML = rows;
  }

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
});