// Common admin behaviors
document.addEventListener('DOMContentLoaded', () => {

    // Attach logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            ensureLogoutModal(); // make sure modal exists
            const logoutUrl = '../../database/admin/logout.php';
            showLogoutModal(() => doLogout(logoutUrl));
        });
    }

    // If you still have other <a href="logout.php"> elements in future, this will handle them
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href$="logout.php"]');
        if (!link) return;
        e.preventDefault();
        ensureLogoutModal();
        showLogoutModal(() => {
            const logoutUrl = link.getAttribute('href');
            doLogout(logoutUrl);
        });
    });
});

// Ensure the modal exists
function ensureLogoutModal() {
    if (document.getElementById('logoutModalOverlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'logoutModalOverlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const title = document.createElement('h2');
    title.textContent = 'Confirm Logout';

    const msg = document.createElement('p');
    msg.textContent = 'Are you sure you want to log out?';

    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-cancel';
    cancelBtn.textContent = 'Cancel';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-confirm';
    confirmBtn.textContent = 'Log out';

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    modal.appendChild(title);
    modal.appendChild(msg);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Clicking outside modal closes it
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideLogoutModal();
    });

    // Cancel button
    cancelBtn.addEventListener('click', hideLogoutModal);

    // Confirm button
    confirmBtn.addEventListener('click', () => {
        if (typeof overlay._onConfirm === 'function') {
            const fn = overlay._onConfirm;
            hideLogoutModal();
            fn();
        } else {
            hideLogoutModal();
        }
    });
}

// Show modal
function showLogoutModal(onConfirm) {
    const overlay = document.getElementById('logoutModalOverlay');
    if (!overlay) return false;
    overlay._onConfirm = onConfirm;
    overlay.classList.add('active');
    return true;
}

// Hide modal
function hideLogoutModal() {
    const overlay = document.getElementById('logoutModalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay._onConfirm = null;
}

// Logout function
function doLogout(logoutUrl) {
    fetch(logoutUrl, { credentials: 'include' })
        .finally(() => {
            window.location.href = 'admin-login.html';
        });
}