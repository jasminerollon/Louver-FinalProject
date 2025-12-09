document.addEventListener('DOMContentLoaded', () => {
  const sortDropdown = document.querySelector('.sort-dropdown');
  const sortMenu = document.querySelector('#sortMenu');
  const sortValueEl = document.querySelector('#sort-value');

  if (!sortDropdown || !sortMenu) return;

  const button = sortDropdown.querySelector('.sort-btn');
  if (button) {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      sortMenu.classList.toggle('active');
    });
  }

  sortMenu.addEventListener('click', (e) => {
    const item = e.target.closest('p[data-sort]');
    if (!item) return;
    window.adminSort = item.getAttribute('data-sort');
    if (sortValueEl) sortValueEl.textContent = item.textContent;
    sortMenu.classList.remove('active');
    document.dispatchEvent(new CustomEvent('admin-sort-changed', { detail: { sort: window.adminSort } }));
  });

  document.addEventListener('click', () => sortMenu.classList.remove('active'));
});