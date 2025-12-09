document.addEventListener('DOMContentLoaded', function() {
    // Update current date and time
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute

    // Fetch applications from database
    fetchApplications();

    // Sort dropdown toggle
    const sortBtn = document.querySelector('.sort-btn');
    const sortMenu = document.getElementById('sortMenu');
    
    if (sortBtn) {
        sortBtn.addEventListener('click', function() {
            sortMenu.classList.toggle('active');
        });
    }

    // Sort menu item selection
    const sortItems = document.querySelectorAll('.sort-menu p');
    sortItems.forEach(item => {
        item.addEventListener('click', function() {
            const sortType = this.getAttribute('data-sort');
            const sortLabel = document.getElementById('sortLabel');
            sortLabel.textContent = this.textContent;
            sortMenu.classList.remove('active');
            
            // Re-fetch or sort the current data
            sortApplications(sortType);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('appSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            filterApplications(this.value);
        });
    }

    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.applications-table tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    // Close sort menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.sort-dropdown')) {
            sortMenu.classList.remove('active');
        }
    });

    // Setup modal event listeners
    setupModalListeners();

    // Setup rejection modal listeners
    setupRejectionModalListeners(); // <-- Add this line
});

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = dateString;
}

// Fetch applications from server
let allApplications = [];

function fetchApplications() {
    fetch('../../database/admin/getApplications.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                allApplications = data.data;
                populateTable(allApplications);
            } else {
                console.error('Error:', data.message);
                showEmptyState();
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            showEmptyState();
        });
}

function populateTable(applications) {
    const tbody = document.getElementById('applicationsTableBody');
    tbody.innerHTML = '';

    if (applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No applications found</td></tr>';
        return;
    }

    applications.forEach(app => {
        const row = document.createElement('tr');
        const statusClass = app.status.toLowerCase();
        
        row.innerHTML = `
            <td><input type="checkbox" aria-label="Select ${app.application_id}"></td>
            <td>${app.application_id}</td>
            <td>${app.date_submitted}</td>
            <td>${app.business_name}</td>
            <td>${app.owner_name}</td>
            <td><span class="status ${statusClass}">${app.status}</span></td>
            <td><button class="view-btn" data-application-id="${app.application_id}"><i class="fas fa-eye"></i> View</button></td>
        `;
        
        tbody.appendChild(row);
    });

    // Re-bind view buttons after populating
    const viewBtns = tbody.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const applicationId = this.getAttribute('data-application-id');
            currentApplicationId = applicationId; // update current ID
            openApplicationModal(applicationId);
        });
    });
}

// Filter applications based on search input
function filterApplications(searchTerm) {
    const filtered = allApplications.filter(app => {
        const searchLower = searchTerm.toLowerCase();
        return app.application_id.toLowerCase().includes(searchLower) ||
               app.business_name.toLowerCase().includes(searchLower) ||
               app.owner_name.toLowerCase().includes(searchLower) ||
               app.email.toLowerCase().includes(searchLower);
    });
    
    populateTable(filtered);
}

// Sort applications
function sortApplications(sortType) {
    let sorted = [...allApplications];

    switch(sortType) {
        case 'relevance':
            sorted = allApplications;
            break;
        case 'newest':
            sorted.sort((a, b) => new Date(b.date_submitted) - new Date(a.date_submitted));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.date_submitted) - new Date(b.date_submitted));
            break;
        case 'status':
            sorted.sort((a, b) => a.status.localeCompare(b.status));
            break;
        default:
            sorted = allApplications;
    }

    populateTable(sorted);
}

// Show empty state
function showEmptyState() {
    const tbody = document.getElementById('applicationsTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">Error loading applications</td></tr>';
}

// Modal Functions
let currentApplicationId = null;

function setupModalListeners() {
    const modal = document.getElementById('applicationModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('btnCancel');
    const approveBtn = document.getElementById('btnApprove');
    const rejectBtn = document.getElementById('btnReject');
    const rejectionSection = document.getElementById('rejectionSection');

    // Close modal
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Open rejection modal when reject button is clicked
    rejectBtn.addEventListener('click', function() {
        openRejectionModal();
    });

    // Approve application
    approveBtn.addEventListener('click', approveApplication);
}

function setupRejectionModalListeners() {
    const rejectionOverlay = document.getElementById('rejectionModalOverlay');
    const cancelBtn = document.getElementById('rejectionCancelBtn');
    const confirmBtn = document.getElementById('rejectionConfirmBtn');
    const radioButtons = document.querySelectorAll('input[name="rejectionReason"]');
    const otherReasonInput = document.getElementById('otherReasonInput');
    const otherReasonText = document.getElementById('otherReasonText');

    // Handle radio button changes
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            // Update UI for selected option
            document.querySelectorAll('.rejection-option').forEach(option => {
                option.classList.remove('selected');
            });
            this.closest('.rejection-option').classList.add('selected');

            // Show/hide other reason input
            if (this.value === 'others') {
                otherReasonInput.classList.add('active');
                otherReasonText.focus();
            } else {
                otherReasonInput.classList.remove('active');
                otherReasonText.value = '';
            }
        });
    });

    // Cancel button
    cancelBtn.addEventListener('click', closeRejectionModal);

    // Close on overlay click
    rejectionOverlay.addEventListener('click', function(e) {
        if (e.target === rejectionOverlay) {
            closeRejectionModal();
        }
    });

    // Confirm button
    confirmBtn.addEventListener('click', confirmRejection);
}

function openApplicationModal(applicationId) {
    console.log('Modal opening with ID:', applicationId); // Debug log
    
    if (!applicationId) {
        alert('Error: Application ID is missing');
        return;
    }
    
    currentApplicationId = applicationId;
    const modal = document.getElementById('applicationModal');
    
    // Show modal with loading state
    modal.classList.add('active');
    
    // Fetch application details
    fetch(`../../database/admin/getApplicationDetail.php?application_id=${applicationId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateModal(data.data);
            } else {
                alert('Error loading application details: ' + data.message);
                closeModal();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load application details');
            closeModal();
        });
}

function populateModal(application) {
    // Populate basic information
    document.getElementById('modalAppId').textContent = application.application_id;
    document.getElementById('modalRegNo').textContent = application.registration_no;
    document.getElementById('modalBusinessName').textContent = application.business_name;
    document.getElementById('modalOwnerName').textContent = application.owner_name || '-';
    document.getElementById('modalDateSubmitted').textContent = application.date_submitted;
    
    // Status badge
    const statusElement = document.getElementById('modalStatus');
    const statusClass = application.status.toLowerCase();
    statusElement.innerHTML = `<span class="status-badge ${statusClass}">${application.status}</span>`;
    
    // Contact information
    document.getElementById('modalContact').textContent = application.contact_number;
    document.getElementById('modalEmail').textContent = application.email || '-';
    
    // Location details
    document.getElementById('modalAddress').textContent = application.address;
    document.getElementById('modalLocation').textContent = application.location_detail || '-';
    
    // Description
    document.getElementById('modalDescription').textContent = application.description || '-';
    
    // Business permit
const permitIframe = document.getElementById('modalPermitLink');
const inspectBtn = document.getElementById('inspectPermit');

if (application.business_permit) {
    // Construct full path to file
    const permitPath = `../../assets/files/${application.business_permit}`;

    permitIframe.src = permitPath + "#toolbar=0&navpanes=0&scrollbar=0";

    // Show the Inspect button and set its href
    inspectBtn.href = permitPath;
    inspectBtn.style.display = 'inline-flex';
} else {
    permitIframe.src = '';
    inspectBtn.style.display = 'none';
}

    
    // Show/hide action buttons based on status
    const modalActions = document.getElementById('modalActions');
    const approveBtn = document.getElementById('btnApprove');
    const rejectBtn = document.getElementById('btnReject');
    const rejectionSection = document.getElementById('rejectionSection');
    
    if (application.status === 'Pending') {
        approveBtn.style.display = 'flex';
        rejectBtn.style.display = 'flex';
        rejectionSection.classList.remove('active');
        document.getElementById('rejectionReason').value = '';
    } else {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
    }
}

function closeModal() {
    const modal = document.getElementById('applicationModal');
    modal.classList.remove('active');
    currentApplicationId = null;
}

function openRejectionModal() {
    const rejectionOverlay = document.getElementById('rejectionModalOverlay');
    rejectionOverlay.classList.add('active');

    // Reset form
    document.querySelectorAll('input[name="rejectionReason"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('.rejection-option').forEach(option => option.classList.remove('selected'));
    document.getElementById('otherReasonInput').classList.remove('active');
    document.getElementById('otherReasonText').value = '';
    document.getElementById('rejectionDetails').value = '';
    document.getElementById('rejectionError').classList.remove('show');

    // Reset the confirm button
    const confirmBtn = document.getElementById('rejectionConfirmConfirmBtn');
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = 'Confirm Reject';
}


function closeRejectionModal() {
    const rejectionOverlay = document.getElementById('rejectionModalOverlay');
    rejectionOverlay.classList.remove('active');
}


function confirmRejection() {
    if (!currentApplicationId) return;

    const selectedReason = document.querySelector('input[name="rejectionReason"]:checked');
    const errorElement = document.getElementById('rejectionError');

    if (!selectedReason) {
        errorElement.textContent = 'Please select a rejection reason';
        errorElement.classList.add('show');
        return;
    }

    let rejectionReason = selectedReason.value;
    const otherReasonText = document.getElementById('otherReasonText').value.trim();

    if (rejectionReason === 'others' && otherReasonText) {
        rejectionReason = otherReasonText;
    } else if (rejectionReason === 'others' && !otherReasonText) {
        errorElement.textContent = 'Please specify the reason for "Others"';
        errorElement.classList.add('show');
        return;
    }

    const additionalDetails = document.getElementById('rejectionDetails').value.trim();
    if (additionalDetails) {
        rejectionReason += ' | Additional details: ' + additionalDetails;
    }

    // Open the rejection confirmation modal instead of using confirm()
    const overlay = document.getElementById('rejectionConfirmationOverlay');
    overlay.classList.add('active');

    const cancelBtn = document.getElementById('rejectionConfirmCancelBtn');
    const confirmBtn = document.getElementById('rejectionConfirmConfirmBtn');

    cancelBtn.onclick = () => {
        overlay.classList.remove('active');
    };

    confirmBtn.onclick = () => {
        overlay.classList.remove('active');
        sendRejectionRequest(rejectionReason);
    };
}

// Move the fetch call into a separate function
function sendRejectionRequest(rejectionReason) {
    const confirmBtn = document.getElementById('rejectionConfirmConfirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rejecting...';

    fetch('../../database/admin/updateApplicationStatus.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            application_id: currentApplicationId,
            status: 'Rejected',
            rejection_reason: rejectionReason
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            closeRejectionModal();
            closeModal();
            fetchApplications();
            showSuccessModal('Application Rejected', 'The application has been rejected successfully!');
        } else {
            showSuccessModal('Error', data.message);
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Confirm Reject';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showSuccessModal('Error', 'Failed to reject application');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Confirm Reject';
    });
}


function setupRejectionModalListeners() {
    const rejectionOverlay = document.getElementById('rejectionModalOverlay');
    const cancelBtn = document.getElementById('rejectionCancelBtn');
    const confirmBtn = document.getElementById('rejectionConfirmBtn');
    const radioButtons = document.querySelectorAll('input[name="rejectionReason"]');
    const otherReasonInput = document.getElementById('otherReasonInput');
    const otherReasonText = document.getElementById('otherReasonText');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.rejection-option').forEach(option => {
                option.classList.remove('selected');
            });
            this.closest('.rejection-option').classList.add('selected');

            if (this.value === 'others') {
                otherReasonInput.classList.add('active');
                otherReasonText.focus();
            } else {
                otherReasonInput.classList.remove('active');
                otherReasonText.value = '';
            }
        });
    });

    cancelBtn.addEventListener('click', closeRejectionModal);

    rejectionOverlay.addEventListener('click', function(e) {
        if (e.target === rejectionOverlay) {
            closeRejectionModal();
        }
    });

    confirmBtn.addEventListener('click', confirmRejection);
}

function approveApplication() {
    if (!currentApplicationId) return;

    // Open approval modal
    const approvalOverlay = document.getElementById('approvalModalOverlay');
    approvalOverlay.classList.add('active');

    const cancelBtn = document.getElementById('approvalCancelBtn');
    const confirmBtn = document.getElementById('approvalConfirmBtn');

    // Reset the confirm button
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = 'Confirm Approve';

    // Cancel button closes modal
    cancelBtn.onclick = () => approvalOverlay.classList.remove('active');

    // Confirm approval
    confirmBtn.onclick = () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Approving...';

        fetch('../../database/admin/updateApplicationStatus.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                application_id: currentApplicationId,
                status: 'Approved'
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                approvalOverlay.classList.remove('active');
                closeModal();
                fetchApplications();
                showSuccessModal('Application Approved', 'The application has been approved successfully!');
            } else {
                showSuccessModal('Error', data.message);
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = 'Confirm Approve';
            }
        })
        .catch(err => {
            console.error(err);
            showSuccessModal('Error', 'Failed to approve application');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Confirm Approve';
        });
    };
}


function showSuccessModal(title, message) {
    const overlay = document.getElementById('successModalOverlay');
    const modalTitle = document.getElementById('successModalTitle');
    const modalMessage = document.getElementById('successModalMessage');
    const closeBtn = document.getElementById('successModalCloseBtn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    overlay.classList.add('active');

    closeBtn.onclick = () => {
        overlay.classList.remove('active');
    };

    // Optional: auto-close after 3 seconds
    // setTimeout(() => overlay.classList.remove('active'), 3000);
}

