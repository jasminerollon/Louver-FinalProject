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
        
        row.innerHTML = `
            <td><input type="checkbox" aria-label="Select ${app.application_id}"></td>
            <td>${app.application_id}</td>
            <td>${app.date_submitted}</td>
            <td>${app.business_name}</td>
            <td>${app.owner_name}</td>
            <td><span class="status ${statusClass}">${app.status}</span></td>
            <td><button class="view-btn" data-vendor-id="${app.vendor_id}"><i class="fas fa-eye"></i> View</button></td>
        `;
        
        tbody.appendChild(row);

        // Add click handler to view button
        const viewBtn = row.querySelector('.view-btn');
        viewBtn.addEventListener('click', function() {
            // Handle view button click - can be extended with modal functionality
            console.log('View application:', app.vendor_id);
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
