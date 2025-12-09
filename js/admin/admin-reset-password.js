'use strict';

(function () {
  const cancelBtn = document.querySelector('.btn-cancel');
  const saveBtn = document.querySelector('.btn-save');
  const newPassEl = document.getElementById('new-password');
  const confirmPassEl = document.getElementById('confirm-password');
  const avatar = document.querySelector('.reset-avatar');
  const toggles = document.querySelectorAll('.toggle-visibility');

  function showPopup(message, type = 'error') {
    // Create overlay
    let overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    // Create popup box
    let box = document.createElement('div');
    box.className = 'popup ' + (type === 'success' ? 'popup-success' : 'popup-error');

    const msg = document.createElement('p');
    msg.className = 'popup-message';
    msg.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'popup-actions';

    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'btn ' + (type === 'success' ? 'btn-save' : 'btn-cancel');
    ok.textContent = 'OK';

    ok.addEventListener('click', () => {
      overlay.remove();
    });

    actions.appendChild(ok);
    box.appendChild(msg);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  // Resolve a stored image path from API to a usable URL
  function resolveImagePath(p) {
    if (!p) return null;
    // Already absolute (http/s) or root-relative
    if (/^https?:\/\//i.test(p) || p.startsWith('/')) return p;
    // If it already starts with ../ or ../../ assume relative from current HTML; keep as-is
    if (p.startsWith('../')) return p;
    // Otherwise, stored as path relative to project root; from html/admin/... we need ../../ prefix
    return '../../' + p.replace(/^\.\/?/, '');
  }

  // Load admin profile image
  async function loadProfileImage() {
    try {
      const resp = await fetch('../../database/admin/getAdminInfo.php', { credentials: 'include' });
      const data = await resp.json();
      if (resp.ok && data.status === 'success') {
        const raw = data.data && data.data.profile_image;
        const defaultPath = '../../assets/pictures/default.png';
        const imgPath = resolveImagePath(raw) || defaultPath;
        if (avatar) {
          const icon = avatar.querySelector('i');
          // Remove any existing <img> to avoid stacking
          const existingImg = avatar.querySelector('img');
          if (existingImg) existingImg.remove();
          const img = document.createElement('img');
          img.src = imgPath;
          img.alt = 'Profile Image';
          img.onload = () => { if (icon) icon.remove(); };
          img.onerror = () => { img.remove(); if (!avatar.querySelector('i')) { const i = document.createElement('i'); i.className = 'fas fa-user'; avatar.appendChild(i); } };
          avatar.appendChild(img);
        }
      }
    } catch (e) {
      // ignore and keep icon fallback
    }
  }

  function setLoading(loading) {
    if (!saveBtn) return;
    saveBtn.disabled = loading;
    saveBtn.textContent = loading ? 'Saving…' : 'Save Changes';
  }

  cancelBtn && cancelBtn.addEventListener('click', () => {
    window.location.href = 'admin-account.html';
  });

  // Toggle show/hide password
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const willShow = input.type === 'password';
      input.type = willShow ? 'text' : 'password';
      const icon = btn.querySelector('i');
      if (icon) {
        if (willShow) {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        } else {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        }
      }
      btn.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');
    });
  });

  saveBtn && saveBtn.addEventListener('click', async () => {
    const newPass = newPassEl.value.trim();
    const confirmPass = confirmPassEl.value.trim();

    // Basic validations
    if (!newPass || !confirmPass) {
      showPopup('Please complete both password fields.');
      return;
    }
    if (newPass.length < 6) {
      showPopup('Password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      showPopup('Passwords do not match.');
      return;
    }

    // Check against current password via backend
    setLoading(true);
    try {
      const resp = await fetch('../../database/admin/checkAdminPassword.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'candidate_password=' + encodeURIComponent(newPass)
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data.status !== 'success') {
        showPopup(data.message || 'Unable to validate current password.');
        setLoading(false);
        return;
      }

      if (data.same === true) {
        showPopup('New password cannot be the same as the current password.');
        setLoading(false);
        return;
      }

      // Proceed to update password
      const upd = await fetch('../../database/admin/updateAdminPassword.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'new_password=' + encodeURIComponent(newPass) + '&confirm_password=' + encodeURIComponent(confirmPass)
      });
      const updData = await upd.json().catch(() => ({}));
      if (!upd.ok || updData.status !== 'success') {
        showPopup(updData.message || 'Failed to update password.');
        setLoading(false);
        return;
      }

      showPopup('Password updated successfully.', 'success');
      setTimeout(() => {
        window.location.href = 'admin-account.html';
      }, 900);
    } catch (e) {
      showPopup('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  // Init
  loadProfileImage();
})();
