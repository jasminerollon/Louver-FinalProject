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
        const icon = document.getElementById('profile-icon');
        const removeBtnInit = document.getElementById('remove-photo');
        if (icon) {
          icon.innerHTML = '';
          if (info.profile_image) {
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.src = `../../${info.profile_image}`;
            icon.appendChild(img);
            if (removeBtnInit) {
              removeBtnInit.style.display = 'block';
              removeBtnInit.dataset.remove = '';
            }
          } else {
            const i = document.createElement('i');
            i.className = 'fas fa-user';
            icon.appendChild(i);
            if (removeBtnInit) {
              removeBtnInit.style.display = 'none';
              removeBtnInit.dataset.remove = '';
            }
          }
        }
      }
    })
    .catch(err => console.error('Prefill error', err));

  // Save changes (supports image upload)
  const saveBtn = document.getElementById('save-changes');
  saveBtn.addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const uploadInput = document.getElementById('upload-input');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('mobile_number', phone);
    if (uploadInput && uploadInput.files && uploadInput.files[0]) {
      formData.append('profile_image', uploadInput.files[0]);
    }
    const removeBtn = document.getElementById('remove-photo');
    if (removeBtn && removeBtn.dataset.remove === '1') {
      formData.append('remove_image', '1');
    }

    fetch('../../database/admin/updateAdminProfile.php', {
      method: 'POST',
      body: formData
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === 'success') {
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
  const removeBtn = document.getElementById('remove-photo');
  if (uploadBtn && uploadInput) {
    uploadBtn.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', () => {
      const file = uploadInput.files[0];
      if (file) {
        // Preview selected image
        const icon = document.getElementById('profile-icon');
        icon.innerHTML = '';
        const img = document.createElement('img');
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.src = URL.createObjectURL(file);
        icon.appendChild(img);
        if (removeBtn) {
          removeBtn.style.display = 'block';
          removeBtn.dataset.remove = '';
        }
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (uploadInput) uploadInput.value = '';
      const icon = document.getElementById('profile-icon');
      icon.innerHTML = '';
      const i = document.createElement('i');
      i.className = 'fas fa-user';
      icon.appendChild(i);
      removeBtn.style.display = 'none';
      removeBtn.dataset.remove = '1';
    });
  }
});
