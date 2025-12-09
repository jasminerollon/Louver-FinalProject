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

// Populate table with applications
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
        
        // FIXED: Changed data-vendor-id to data-application-id
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

        // Add click handler to view button
        const viewBtn = row.querySelector('.view-btn');
        viewBtn.addEventListener('click', function() {
            const applicationId = this.getAttribute('data-application-id');
            console.log('Opening modal for application:', applicationId); // Debug log
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

    // Show rejection input when reject is clicked
    rejectBtn.addEventListener('click', function() {
        rejectionSection.classList.add('active');
        rejectBtn.textContent = 'Confirm Rejection';
        rejectBtn.onclick = confirmRejection;
    });

    // Approve application
    approveBtn.addEventListener('click', approveApplication);
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
    const rejectionSection = document.getElementById('rejectionSection');
    const rejectBtn = document.getElementById('btnReject');
    
    modal.classList.remove('active');
    rejectionSection.classList.remove('active');
    document.getElementById('rejectionReason').value = '';
    
    // Reset reject button
    rejectBtn.innerHTML = '<i class="fas fa-times"></i> Reject';
    rejectBtn.onclick = function() {
        rejectionSection.classList.add('active');
        rejectBtn.textContent = 'Confirm Rejection';
        rejectBtn.onclick = confirmRejection;
    };
    
    currentApplicationId = null;
}

function approveApplication() {
    if (!currentApplicationId) return;
    
    if (!confirm('Are you sure you want to approve this application?')) {
        return;
    }
    
    const approveBtn = document.getElementById('btnApprove');
    approveBtn.disabled = true;
    approveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Approving...';
    
    fetch('../../database/admin/updateApplicationStatus.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            application_id: currentApplicationId,
            status: 'Approved'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Application approved successfully!');
            closeModal();
            fetchApplications(); // Refresh the table
        } else {
            alert('Error: ' + data.message);
            approveBtn.disabled = false;
            approveBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to approve application');
        approveBtn.disabled = false;
        approveBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
    });
}

function confirmRejection() {
    if (!currentApplicationId) return;
    
    const rejectionReason = document.getElementById('rejectionReason').value.trim();
    
    if (!rejectionReason) {
        alert('Please provide a reason for rejection');
        return;
    }
    
    if (!confirm('Are you sure you want to reject this application?')) {
        return;
    }
    
    const rejectBtn = document.getElementById('btnReject');
    rejectBtn.disabled = true;
    rejectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rejecting...';
    
    fetch('../../database/admin/updateApplicationStatus.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            application_id: currentApplicationId,
            status: 'Rejected',
            rejection_reason: rejectionReason
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Application rejected successfully!');
            closeModal();
            fetchApplications(); // Refresh the table
        } else {
            alert('Error: ' + data.message);
            rejectBtn.disabled = false;
            rejectBtn.innerHTML = 'Confirm Rejection';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to reject application');
        rejectBtn.disabled = false;
        rejectBtn.innerHTML = 'Confirm Rejection';
    });
}