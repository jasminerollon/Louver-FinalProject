document.addEventListener('DOMContentLoaded', () => {
  // Prefill form with current admin data
  fetch('../../database/admin/getAdminInfo.php')
    .then(r => r.json())
    .then(data => {
      if (data.status === 'success') {
        const info = data.data;
        document.getElementById('name').value = info.name !== 'N/A' ? info.name : '';
        document.getElementById('email').value = info.email !== 'N/A' ? info.email : '';
        document.getElementById('phone').value = info.mobile_number !== 'N/A' ? info.mobile_number : '';
      }
    })
    .catch(err => console.error('Prefill error', err));

  // Save changes
  const saveBtn = document.getElementById('save-changes');
  saveBtn.addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const payload = { name, email, mobile_number: phone };

    fetch('../../database/admin/updateAdminProfile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === 'success') {
        // Navigate back to profile overview
        window.location.href = 'admin-account.html';
      } else {
        alert(data.message || 'Failed to save changes');
      }
    })
    .catch(err => {
      console.error('Save error', err);
      alert('An error occurred while saving.');
    });
  });

  // Upload image UI (placeholder)
  const uploadBtn = document.getElementById('upload-btn');
  const uploadInput = document.getElementById('upload-input');
  if (uploadBtn && uploadInput) {
    uploadBtn.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', () => {
      const file = uploadInput.files[0];
      if (file) {
        // Preview only (no backend image handling implemented)
        const icon = document.getElementById('profile-icon');
        icon.innerHTML = '';
        const img = document.createElement('img');
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.src = URL.createObjectURL(file);
        icon.appendChild(img);
      }
    });
  }
});
