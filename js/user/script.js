document.addEventListener('DOMContentLoaded', function() {
    // Cart click handler - redirect to customer-cart.html
    const cartElement = document.querySelector('.cart');
    if (cartElement) {
        cartElement.addEventListener('click', function() {
            window.location.href = 'customer-cart.html';
        });
        cartElement.style.cursor = 'pointer';
    }
        // Logout button handler with confirmation modal
        const logoutBtn = document.getElementById('logout-btn');
        const logoutModal = document.getElementById('logout-modal');
        const confirmLogout = document.getElementById('confirm-logout');
        const cancelLogout = document.getElementById('cancel-logout');

        if (logoutBtn && logoutModal && confirmLogout && cancelLogout) {
            logoutBtn.addEventListener('click', function() {
                logoutModal.style.display = 'flex';
            });
            cancelLogout.addEventListener('click', function() {
                logoutModal.style.display = 'none';
            });
            confirmLogout.addEventListener('click', function() {
                fetch('../../database/user/logout.php', { method: 'POST' })
                    .then(() => {
                        window.location.href = 'login.html';
                    })
                    .catch(() => {
                        window.location.href = 'login.html';
                    });
            });
        }

    const activeContainer = document.querySelector('.orders.active-orders .orders-list');
    const pastContainer = document.querySelector('.orders.past-orders .orders-list');
    const reportedContainer = document.querySelector('.orders.reported-orders .orders-list');

    let ordersState = [];
    let currentOrder = null;

    //for edit customer info 
    const saveBtn = document.getElementById('save-changes');
    const signupForm = document.getElementById('signup-form');
    const signupBtn = document.getElementById('go-to-signup');
    const passwordForm = document.getElementById('passwordForm');
    const restoSearchInput = document.getElementById("restoSearchInput");

    let allVendors = [];
    // Function to render vendors
    function renderVendors(vendors) {
        const container = document.getElementById("vendorsContainer");
        if (!container) return;
        
        container.innerHTML = "";
        vendors.forEach(v => {
            const card = document.createElement('article');
            card.className = 'card';
            card.style.cursor = 'pointer';
            card.onclick = () => {
                window.location.href = `customer-products.html?rid=${v.vendor_id}`;
            };
            
            card.innerHTML = `
                <div class="card-image">
                    <img src="../../assets/pictures/${v.profile_image}" alt="${v.business_name}">
                </div>
                <div class="card-info">
                    <h3>${v.business_name}</h3>
                    <div class="meta">${v.address}</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    //vendors/resto fetch in users 
    fetch("../../database/user/getVendors.php")
        .then(response => response.json())
        .then(vendors => {
        allVendors = vendors;
        console.log(vendors); 
        renderVendors(vendors);
    })
    .catch(err => console.error(err));

    // ----------------------------
    // Orders + report flow
    // ----------------------------
    const orderModalOverlay = document.getElementById('order-modal-overlay');
    const orderModalClose = orderModalOverlay?.querySelector('.order-modal-close');
    const modalRestaurant = document.getElementById('modal-restaurant');
    const modalMeta = document.getElementById('modal-meta');
    const modalItems = document.getElementById('modal-items');
    const modalTotal = document.getElementById('modal-total');
    const statusText = document.getElementById('status-text');
    const reportBtn = document.getElementById('reportBtn');
    const itemTemplate = document.getElementById('order-item-template');

    const reportModalOverlay = document.getElementById('report-modal-overlay');
    const reportCategorySelect = document.getElementById('issue_category');
    const reportDescription = document.getElementById('report_description');
    const reportFileInput = reportModalOverlay?.querySelector('input[type="file"]');
    const reportFileLabel = reportModalOverlay?.querySelector('.upload-proof span');
    const reportOrderIdLabel = document.getElementById('report-order-id');
    const reportVendorLabel = document.getElementById('report-vendor');
    const cancelReportBtn = document.getElementById('cancelReport');
    const confirmReportBtn = document.getElementById('confirmReport');

    const viewReportOverlay = document.getElementById('view-report-overlay');
    const closeViewReportBtn = document.getElementById('closeViewReport');
    const viewReportOrder = document.getElementById('view-report-order');
    const viewReportVendor = document.getElementById('view-report-vendor');
    const viewReportIssue = document.getElementById('view-report-issue');
    const viewReportStatus = document.getElementById('view-report-status');
    const viewReportDecision = document.getElementById('view-report-decision');
    const viewReportFeedback = document.getElementById('view-report-feedback');

    const categoriesLoaded = { done: false };

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return `Ordered on ${date.toDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }

    function toggleEmpty(container, hasData) {
        if (!container) return;
        const msg = container.querySelector('.no-orders-msg');
        if (msg) msg.style.display = hasData ? 'none' : '';
    }

    function renderOrders(orders) {
        if (activeContainer) activeContainer.innerHTML = '<p class="no-orders-msg">You have no active orders.</p>';
        if (pastContainer) pastContainer.innerHTML = '<p class="no-orders-msg">You have no past orders.</p>';
        if (reportedContainer) reportedContainer.innerHTML = '<p class="no-orders-msg">You have no reported orders.</p>';

        orders.forEach(order => {
            const card = document.createElement('article');
            card.classList.add('order-card');
            card.dataset.orderId = order.order_id;
            card.dataset.vendorId = order.vendor_id;
            card.dataset.vendorName = order.vendor_name;
            card.dataset.total = `₱ ${order.total_price}`;
            if (order.issue_status) card.dataset.issueStatus = order.issue_status;
            if (order.vendor_decision) card.dataset.vendorDecision = order.vendor_decision;
            if (order.vendor_feedback) card.dataset.vendorFeedback = order.vendor_feedback;
            if (order.issue_reason) card.dataset.issueReason = order.issue_reason;

            const isReported = order.status === 'Reported' || order.issue_status;
            const actionsHtml = isReported
                ? `<button class="btn btn-view-report" data-order-id="${order.order_id}">VIEW REPORT</button>`
                : `<button class="btn btn-status" data-order-id="${order.order_id}">${(order.status || '').toUpperCase()}</button>`;

            card.innerHTML = `
                <div class="order-image">
                    <img src="../../assets/pictures/${order.vendor_image}" alt="${order.vendor_name} logo">
                </div>
                <div class="order-info">
                    <h3>${order.vendor_name}</h3>
                    <div class="order-meta">
                        ${formatDate(order.created_at)}<br>
                        <strong>Order # ${order.order_id}</strong>
                    </div>
                    <ul class="order-items"></ul>
                </div>
                <div class="order-actions">
                    ${actionsHtml}
                </div>
            `;

            const isPast = order.status === 'Delivered' || order.status === 'Rejected';
            const target = isReported ? reportedContainer : (isPast ? pastContainer : activeContainer);
            if (target) {
                toggleEmpty(target, true);
                target.appendChild(card);
            }
        });
    }

    function loadOrders() {
        if (!(activeContainer || pastContainer)) return;
        fetch('../../database/user/getOrders.php')
            .then(res => res.json())
            .then(orders => {
                ordersState = Array.isArray(orders) ? orders : [];
                renderOrders(ordersState);
            })
            .catch(err => console.error(err));
    }

    function clearNode(node) {
        if (!node) return;
        while (node.firstChild) node.removeChild(node.firstChild);
    }

    function openOrderModal(orderId) {
        if (!orderModalOverlay) return;
        const order = ordersState.find(o => String(o.order_id) === String(orderId));
        const card = document.querySelector(`.order-card[data-order-id="${orderId}"]`);
        if (!order || !card) return;
        currentOrder = order;

        if (modalRestaurant) modalRestaurant.textContent = order.vendor_name || 'Your Order';
        if (modalMeta) modalMeta.innerHTML = `${formatDate(order.created_at)}<br><strong>Order # ${order.order_id}</strong>`;
        if (modalTotal) modalTotal.textContent = `₱ ${order.total_price}`;
        if (statusText) statusText.textContent = `Status: ${order.status}`;

        clearNode(modalItems);
        const items = Array.isArray(order.order_items) ? order.order_items : [];
        if (items.length && itemTemplate) {
            items.forEach(it => {
                const row = itemTemplate.content.cloneNode(true);
                const t = row.querySelector('.modal-item-text');
                const p = row.querySelector('.modal-item-price');
                if (t) t.textContent = `${it.quantity} x ${it.product_name}`;
                if (p) p.textContent = `₱ ${(Number(it.price_at_time) * Number(it.quantity)).toFixed(2)}`;
                modalItems.appendChild(row);
            });
        } else {
            const fallback = document.createElement('div');
            fallback.className = 'modal-item';
            fallback.textContent = 'Items for this order are not available yet.';
            modalItems.appendChild(fallback);
        }

        orderModalOverlay.hidden = false;
        orderModalOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeOrderModal() {
        if (!orderModalOverlay) return;
        orderModalOverlay.hidden = true;
        orderModalOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    orderModalClose?.addEventListener('click', closeOrderModal);
    orderModalOverlay?.addEventListener('click', e => e.target === orderModalOverlay && closeOrderModal());
    document.addEventListener('keydown', e => e.key === 'Escape' && !orderModalOverlay?.hidden && closeOrderModal());

    document.addEventListener('click', e => {
        const statusBtn = e.target.closest('.btn-status');
        if (statusBtn) {
            const orderId = statusBtn.dataset.orderId;
            openOrderModal(orderId);
            return;
        }

        const viewReportBtn = e.target.closest('.btn-view-report');
        if (viewReportBtn) {
            const orderId = viewReportBtn.dataset.orderId;
            openViewReportModal(orderId);
        }
    });

    function populateReportCategories() {
        if (!reportCategorySelect || categoriesLoaded.done) return;
        fetch('../../database/user/getOrderCategories.php')
            .then(res => res.json())
            .then(categories => {
                reportCategorySelect.innerHTML = '';
                (categories || []).forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = cat;
                    reportCategorySelect.appendChild(opt);
                });
                categoriesLoaded.done = true;
            })
            .catch(err => console.error('Failed to fetch categories:', err));
    }

    function resetReportForm() {
        if (reportDescription) reportDescription.value = '';
        if (reportFileInput) reportFileInput.value = '';
        if (reportFileLabel) reportFileLabel.textContent = 'Upload screenshots, photos, or videos';
    }

    function openReportModal() {
        if (!reportModalOverlay) return;
        if (!currentOrder) {
            alert('Open an order first to report it.');
            return;
        }
        // Block double reports
        if (currentOrder.status === 'Reported' || currentOrder.issue_status) {
            alert('This order has already been reported. You can view the report status instead.');
            return;
        }
        populateReportCategories();
        if (reportOrderIdLabel) reportOrderIdLabel.textContent = `Order # ${currentOrder.order_id}`;
        if (reportVendorLabel) reportVendorLabel.textContent = `Vendor: ${currentOrder.vendor_name || ''}`;

        resetReportForm();
        reportModalOverlay.hidden = false;
        reportModalOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeReportModal() {
        if (!reportModalOverlay) return;
        reportModalOverlay.hidden = true;
        reportModalOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    function submitReport() {
        if (!currentOrder) {
            alert('Cannot submit report: missing order info.');
            return;
        }
        if (currentOrder.status === 'Reported' || currentOrder.issue_status) {
            alert('This order has already been reported.');
            return;
        }
        const formData = new FormData();
        formData.append('order_id', currentOrder.order_id);
        formData.append('vendor_id', currentOrder.vendor_id);
        formData.append('issue_category', reportCategorySelect?.value || '');
        formData.append('description', reportDescription?.value?.trim() || '');
        if (reportFileInput && reportFileInput.files.length > 0) {
            formData.append('customer_proof', reportFileInput.files[0]);
        }

        fetch('../../database/user/submitReport.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data?.success) {
                alert(data.message || 'Report submitted successfully!');
                closeReportModal();
                resetReportForm();
                // Update local state so the UI immediately reflects the reported status
                if (currentOrder) {
                    currentOrder.status = 'Reported';
                    currentOrder.issue_status = currentOrder.issue_status || 'Pending';
                }
                loadOrders();
            } else {
                alert(data?.message || 'Failed to submit report.');
            }
        })
        .catch(err => {
            console.error('Submit report failed:', err);
            alert('Failed to submit report. Please try again.');
        });
    }

    reportBtn?.addEventListener('click', openReportModal);
    cancelReportBtn?.addEventListener('click', closeReportModal);
    reportModalOverlay?.addEventListener('click', e => e.target === reportModalOverlay && closeReportModal());
    document.addEventListener('keydown', e => e.key === 'Escape' && !reportModalOverlay?.hidden && closeReportModal());
    reportFileInput?.addEventListener('change', () => {
        if (!reportFileLabel) return;
        if (reportFileInput.files.length === 0) {
            reportFileLabel.textContent = 'Upload screenshots, photos, or videos';
        } else if (reportFileInput.files.length === 1) {
            reportFileLabel.textContent = reportFileInput.files[0].name;
        } else {
            reportFileLabel.textContent = `${reportFileInput.files.length} files selected`;
        }
    });
    confirmReportBtn?.addEventListener('click', submitReport);

    function openViewReportModal(orderId) {
        if (!viewReportOverlay) return;
        const order = ordersState.find(o => String(o.order_id) === String(orderId));
        if (!order) return;
        if (viewReportOrder) viewReportOrder.textContent = `Order # ${order.order_id}`;
        if (viewReportVendor) viewReportVendor.textContent = `Vendor: ${order.vendor_name || ''}`;
        if (viewReportIssue) viewReportIssue.textContent = order.issue_reason || 'N/A';
        if (viewReportStatus) viewReportStatus.textContent = order.issue_status || 'Pending';
        if (viewReportDecision) viewReportDecision.textContent = order.vendor_decision || 'Pending';
        if (viewReportFeedback) viewReportFeedback.textContent = order.vendor_feedback || 'No feedback yet';

        viewReportOverlay.hidden = false;
        viewReportOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeViewReportModal() {
        if (!viewReportOverlay) return;
        viewReportOverlay.hidden = true;
        viewReportOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    closeViewReportBtn?.addEventListener('click', closeViewReportModal);
    viewReportOverlay?.addEventListener('click', e => e.target === viewReportOverlay && closeViewReportModal());
    document.addEventListener('keydown', e => e.key === 'Escape' && !viewReportOverlay?.hidden && closeViewReportModal());

    loadOrders();

    //live search for resto 
    if (restoSearchInput) {
    restoSearchInput.addEventListener("keyup", () => {
        const term = restoSearchInput.value.toLowerCase();
        const filtered = allVendors.filter(v =>
            v.business_name.toLowerCase().includes(term) ||
            v.address.toLowerCase().includes(term)
        );
        renderVendors(filtered);
    });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
    }

    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = this.querySelector('#email').value.trim();
            const password = this.querySelector('#password').value.trim();

            if (!email || !password) {
                alert('Please fill all fields');
                return;
            }

            const formData = new FormData(this);
            
            try {
                const response = await fetch('../../database/user/login.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.status === 'success') {
                    alert(result.message);
                    window.location.href = 'customer-homepage.html';
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });
    }

    // Navigation between pages
    const loginButtons = document.querySelectorAll('.login-btn');
    loginButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Don't navigate if this button is for form submission
            if (this.type === 'submit' || this.id === 'login-btn') return;
            
            e.preventDefault();
            const currentPage = window.location.pathname;
            if (this.id === 'go-to-signup' || this.textContent.includes('SIGN UP')) {
                window.location.href = 'signup.html';
            } else if (this.textContent.includes('LOG IN') || this.textContent.includes('BACK TO LOGIN')) {
                window.location.href = 'login.html';
            }
        });
    });

    // Handle signup buttons specifically
    const signupButtons = document.querySelectorAll('.signup-btn');
    signupButtons.forEach(button => {
        if (button.type !== 'submit') {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (this.textContent.includes('RESET PASSWORD')) {
                    // Handle reset password submission
                    if (passwordForm) {
                        passwordForm.dispatchEvent(new Event('submit'));
                    }
                } else if (this.textContent.includes('SIGN UP')) {
                    // Handle signup submission or navigation
                    if (signupForm) {
                        signupForm.dispatchEvent(new Event('submit'));
                    }
                }
            });
        }
    });


    // Forgot password link navigation
    const forgotPasswordLinks = document.querySelectorAll('.forgot-password a');
    forgotPasswordLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'reset.html';
        });
    });

    // Reset form handler for reset.html page
    const resetForm = document.querySelector('.form-box');
    if (resetForm && document.querySelector('h3') && document.querySelector('h3').textContent.includes('RESET')) {
        const resetBtn = resetForm.querySelector('.signup-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const email = resetForm.querySelector('input[type="email"]').value.trim();
                const newPassword = resetForm.querySelector('input[placeholder*="New Password"]').value.trim();
                const confirmPassword = resetForm.querySelector('input[placeholder*="Confirm"]').value.trim();
                
                if (!email || !newPassword || !confirmPassword) {
                    alert('Please fill all fields');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }
                
                // Here you would send the reset request to your PHP backend
                alert('Password reset functionality would be implemented here');
                window.location.href = 'login.html';
            });
        }
    }

    // Navigation between pages
    const loginButtons2 = document.querySelectorAll('.login-btn');
    loginButtons2.forEach(button => {
        button.addEventListener('click', function() {
            const currentPage = window.location.pathname;
            
            if (currentPage.includes('index.html') || currentPage === '/') {
                // From index.html
                if (this.textContent.includes('LOG IN')) {
                    window.location.href = 'html/login.html';
                } else if (this.textContent.includes('SIGN UP') || this.textContent.includes('GET STARTED')) {
                    window.location.href = 'html/signup.html';
                }
            } else if (currentPage.includes('html/')) {
                // From html folder files
                if (this.textContent.includes('LOG IN') || this.textContent.includes('BACK TO LOGIN')) {
                    window.location.href = 'login.html';
                } else if (this.textContent.includes('SIGN UP')) {
                    window.location.href = 'signup.html';
                }
            }
        });
    });

    // Forgot password link navigation
    const forgotPasswordLinks2 = document.querySelectorAll('.forgot-password a');
    forgotPasswordLinks2.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'reset.html';
        });
    });

    // My Orders page helpers (search/filter, reorder, cart update)
    const ordersSearch = document.querySelector('.search-input');
    if (ordersSearch) {
        ordersSearch.addEventListener('input', function() {
            const q = this.value.trim().toLowerCase();
            const orderCards = document.querySelectorAll('.order-card');
            orderCards.forEach(card => {
                const text = card.textContent.replace(/\s+/g, ' ').toLowerCase();
                if (!q || text.includes(q)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // View Status Button fallback 
    const statusButtonsFallback = document.querySelectorAll('.btn-status');
    statusButtonsFallback.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.order-card');
            if (!card) return;
            const orderMeta = card.querySelector('.order-meta');
            const orderText = orderMeta ? orderMeta.textContent.trim() : '';
            if (!document.getElementById('order-modal-overlay')) {
                alert('Open order status\n' + orderText);
            }
        });
    });

    const reorderButtons = document.querySelectorAll('.btn-reorder');
    reorderButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.order-card');
            const title = card ? (card.querySelector('h3') || {}).textContent : '';
            // Shows an alert for now
            alert('Reorder placed for: ' + (title || 'this order'));
        });
    });

    // Cart count update on reorder
    reorderButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const cartCountEl = document.querySelector('.cart-count');
            if (!cartCountEl) return;
            const n = parseInt(cartCountEl.textContent, 10) || 0;
            cartCountEl.textContent = n + 1;
        });
    });

    //fetch the user info in the account.html 
    fetch('../../database/user/getCustomerInfo.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const info = document.querySelector('.profile-card .info');
                info.querySelectorAll('p')[0].textContent = data.customer_name;
                info.querySelectorAll('p')[1].textContent = data.customer_email;
                info.querySelectorAll('p')[2].textContent = data.customer_contact;

                // set profile images
                const img = document.getElementById('profileImage');
                img.src= data.profile_image;
            }
        })
        .catch(err => console.error('Error fetching user data:', err));

    // Profile image upload
    const uploadBtn = document.getElementById("upload-btn");
    const uploadInput = document.getElementById("upload-input");
    const profileImg = document.getElementById('profileImage');

    fetch('../../database/user/getCustomerInfo.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('name').value = data.customer_name || '';
                document.getElementById('email').value = data.customer_email || '';
                document.getElementById('phone').value = data.customer_contact || '';

                const imgSrc = (!data.profile_image || data.profile_image.endsWith('default.png'))
                    ? "../../assets/pictures/default.png"
                    : "../../assets/uploads/profile_images/" + data.profile_image;

                const tempImg = new Image();
                tempImg.onload = () => profileImg.src = imgSrc;
                tempImg.src = imgSrc;
            } else {
                window.location.href = 'login.html';
            }
        })
        .catch(err => console.error(err));

    // Upload image preview
    if (uploadBtn && uploadInput && profileImg) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault(); // prevent form submission
            uploadInput.click();
        });

        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('profile_image', file);

            fetch('../../database/user/uploadProfileImage.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // update preview
                    profileImg.src = '../../assets/uploads/profile_images/' + data.profile_image;
                    alert(data.message);
                } else {
                    alert(data.message);
                }
            })
            .catch(err => console.error('Error uploading image:', err));
        });
    }

    // Save changes
    if (saveBtn) {
        saveBtn.addEventListener('click', e => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();

            if (!name || !email || !phone) {
                alert('Please fill all fields');
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);

            fetch('../../database/user/updateCustomerInfo.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => alert(data.message))
            .catch(err => console.error('Error updating account info:', err));
        });
    }

    //for reset password in customer profile tab
    if (passwordForm) {
        passwordForm.addEventListener("submit", function(e) {
            e.preventDefault(); // prevent default form submit

            const formData = new FormData(passwordForm);

        fetch("../../database/user/updateCustomerPassword.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            if (data.includes("successfully")) {
                window.location.href = "customer-homepage.html";
            }
        })
        .catch(error => console.error("Error:", error));
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const first_name = signupForm.elements['first_name'].value.trim();
        const last_name = signupForm.elements['last_name'].value.trim();
        const contact_number = signupForm.elements['contact_number'].value.trim();
        const email = signupForm.elements['email'].value.trim();
        const password = signupForm.elements['password'].value;
        const nameRegex = /^[A-Za-z\s]+$/;
        const contactRegex = /^\d{10,15}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!first_name || !nameRegex.test(first_name)) {
            alert("Please enter a valid first name (letters only).");
            return;
        }
        if (!last_name || !nameRegex.test(last_name)) {
            alert("Please enter a valid last name (letters only).");
            return;
        }
        if (!contact_number || !contactRegex.test(contact_number)) {
            alert("Please enter a valid contact number (10-15 digits).");
            return;
        }
        if (!email || !emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        if (!password || password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }
        const formData = new FormData(signupForm);
        try {
            const response = await fetch(signupForm.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            alert(result.message);

            if (result.status === 'success') {
                window.location.href = '/Louver-FinalProject/html/user/login.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
        });
    }

    // Enhanced button navigation for all pages (only for navigation buttons, not form submission)
    document.addEventListener('click', function(e) {
        // Handle SIGN UP navigation buttons (not form submission)
        if (e.target.classList.contains('login-btn') && e.target.textContent.includes('SIGN UP') && !e.target.closest('form')) {
            e.preventDefault();
            window.location.href = 'signup.html';
        }
        
        // Handle LOG IN navigation buttons (not form submission)
        if (e.target.classList.contains('login-btn') && (e.target.textContent.includes('LOG IN') || e.target.textContent.includes('BACK TO LOGIN')) && !e.target.closest('form')) {
            e.preventDefault();
            window.location.href = 'login.html';
        }
        
        // Handle reset password page buttons
        if (e.target.classList.contains('signup-btn') && e.target.textContent.includes('RESET PASSWORD') && !e.target.closest('form')) {
            e.preventDefault();
            
            const email = document.querySelector('input[type="email"]')?.value.trim();
            const newPassword = document.querySelector('input[placeholder*="New Password"]')?.value.trim();
            const confirmPassword = document.querySelector('input[placeholder*="Confirm"]')?.value.trim();
            
            if (!email || !newPassword || !confirmPassword) {
                alert('Please fill all fields');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            alert('Password reset successful! Redirecting to login...');
            window.location.href = 'login.html';
        }
    });

    // Custom dropdown functionality - moved to end to ensure DOM is loaded
    setTimeout(() => {
        console.log('Looking for dropdown elements...');
        const dropdownButton = document.getElementById('sortDropdown');
        const dropdownMenu = document.getElementById('sortMenu');
        const dropdownItems = document.querySelectorAll('.dropdown-item');

        console.log('Dropdown button:', dropdownButton);
        console.log('Dropdown menu:', dropdownMenu);
        console.log('Dropdown items count:', dropdownItems.length);

        if (dropdownButton && dropdownMenu) {
            console.log('Setting up dropdown event listener...');
            
            dropdownButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Dropdown button clicked!');
                
                const isShowing = dropdownMenu.classList.contains('show');
                console.log('Menu currently showing:', isShowing);
                
                dropdownMenu.classList.toggle('show');
                this.classList.toggle('active');
                
                console.log('Menu classes after toggle:', dropdownMenu.className);
                console.log('Dropdown is now:', isShowing ? 'hidden' : 'visible');
            });

            dropdownItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log('Dropdown item clicked:', this.textContent);
                    
                    // Remove selected class from all items
                    dropdownItems.forEach(i => i.classList.remove('selected'));
                    // Add selected class to clicked item
                    this.classList.add('selected');
                    
                    // Close dropdown
                    dropdownMenu.classList.remove('show');
                    dropdownButton.classList.remove('active');
                    
                    // Handle sorting logic here
                    const selectedValue = this.getAttribute('data-value');
                    console.log('Selected sort option:', selectedValue);
                    
                    // Sort vendors based on selection
                    let sortedVendors = [...allVendors];
                    if (selectedValue === 'distance') {
                        // Sort alphabetically by business name
                        sortedVendors.sort((a, b) => a.business_name.localeCompare(b.business_name));
                        console.log('Sorting vendors alphabetically');
                    } else if (selectedValue === 'relevance') {
                        // Keep original order for relevance
                        console.log('Using original vendor order');
                    }
                    
                    // Render sorted vendors
                    renderVendors(sortedVendors);
                });
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(event) {
                if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                    dropdownMenu.classList.remove('show');
                    dropdownButton.classList.remove('active');
                }
            });
        } else {
            console.error('Dropdown elements not found');
        }
    });


});