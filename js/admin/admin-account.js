document.addEventListener('DOMContentLoaded', function() {
    // Fetch admin data from the session
    fetchAdminData();
});

/**
 * Fetch admin profile data from the database
 */
function fetchAdminData() {
    fetch('../../database/admin/getAdminInfo.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                populateAdminProfile(data.data);
            } else {
                showError(data.message || 'Failed to load admin profile');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            showError('An error occurred while loading your profile. Please try again.');
        });
}

/**
 * Populate the profile card with admin data
 * @param {Object} adminData - The admin data from the database
 */
function populateAdminProfile(adminData) {
    // Update Admin ID
    const adminIdElement = document.querySelector('[data-field="admin_id"]');
    if (adminIdElement) {
        adminIdElement.textContent = adminData.admin_id || 'N/A';
    }

    // Update Name
    const nameElement = document.querySelector('[data-field="name"]');
    if (nameElement) {
        nameElement.textContent = adminData.name || 'N/A';
    }

    // Update Email
    const emailElement = document.querySelector('[data-field="email"]');
    if (emailElement) {
        emailElement.textContent = adminData.email || 'N/A';
    }

    // Update Mobile Number
    const mobileElement = document.querySelector('[data-field="mobile_number"]');
    if (mobileElement) {
        mobileElement.textContent = adminData.mobile_number || 'N/A';
    }

    // Update profile image if available
    const icon = document.querySelector('.profile-icon');
    if (icon) {
        icon.innerHTML = '';
        if (adminData.profile_image) {
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.src = `../../${adminData.profile_image}`;
            icon.appendChild(img);
        } else {
            const i = document.createElement('i');
            i.className = 'fas fa-user';
            icon.appendChild(i);
        }
    }
}

/**
 * Display error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
}
