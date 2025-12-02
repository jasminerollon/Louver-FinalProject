document.addEventListener('DOMContentLoaded', function() {
    //for edit customer info 
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const saveBtn = document.getElementById('save-changes');
    const signupForm = document.getElementById('signup-form');
    const signupBtn = document.getElementById('go-to-signup');
    const loginBtn = document.getElementById('login-btn');
    const passwordForm = document.getElementById('passwordForm');

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
    }

    const loginForm = document.querySelector('.form-box h3')?.textContent.includes('LOGIN') ? 
                      document.querySelector('.form-box') : null;

    if (loginForm) {
        const loginBtn = document.getElementById('login-btn');
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const email = loginForm.querySelector('#email').value.trim();
            const password = loginForm.querySelector('#password').value.trim();

            if (!email || !password) {
                alert('Please fill all fields');
                return;
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '../../database/user/login.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            xhr.onload = function() {
                let response;
                try {
                    response = JSON.parse(this.responseText);
                } catch (error) {
                    console.error("Invalid JSON response:", this.responseText);
                    alert("Server error. Check console.");
                    return;
                }

                if (response.status === 'success') {
                    alert(response.message);
                    window.location.href = 'customer-homepage.html';
                } else {
                    alert(response.message);
                }
            };

            xhr.send(`email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        });
    }

    // Navigation between pages
    const loginButtons = document.querySelectorAll('.login-btn');
    loginButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentPage = window.location.pathname;
            if (this.id === 'go-to-signup' || this.textContent.includes('SIGN UP')) {
                window.location.href = '/Louver-FinalProject/html/user/signup.html';
            } else if (this.textContent.includes('LOG IN')) {
                window.location.href = '/Louver-FinalProject/html/user/login.html';
            }
        });
    });

    // Forgot password link navigation
    const forgotPasswordLinks = document.querySelectorAll('.forgot-password a');
    forgotPasswordLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'reset.html';
        });
    });

    /* ----------------------------
       MY ORDERS: modal setup (added)
       - This block only attaches handlers if the modal overlay/template exist in the DOM
       - It uses DOM cloning (template) and textContent/dataset to populate content
       ---------------------------- */
    (function setupOrderModalIfPresent() {
        const overlay = document.getElementById('order-modal-overlay');
        const itemTemplate = document.getElementById('order-item-template');
        // If the page doesn't include the modal overlay + template, do nothing.
        if (!overlay || !itemTemplate) return;

        const modalRestaurant = overlay.querySelector('#modal-restaurant');
        const modalMeta = overlay.querySelector('#modal-meta');
        const modalItemsContainer = overlay.querySelector('#modal-items');
        const modalTotal = overlay.querySelector('#modal-total');
        const modalCloseBtn = overlay.querySelector('.order-modal-close');

        function openOrderModalFromCard(card) {
            if (!card) return;

            const titleEl = card.querySelector('h3');
            modalRestaurant.textContent = titleEl ? titleEl.textContent.trim() : 'Your Order';

            const orderMetaEl = card.querySelector('.order-meta');
            if (orderMetaEl) {
                modalMeta.innerHTML = orderMetaEl.innerHTML;
            } else {
                modalMeta.textContent = '';
            }

            // clear items
            while (modalItemsContainer.firstChild) modalItemsContainer.removeChild(modalItemsContainer.firstChild);

            const itemEls = Array.from(card.querySelectorAll('.order-items li'));
            itemEls.forEach(li => {
                const clone = itemTemplate.content.cloneNode(true);
                const textNode = clone.querySelector('.modal-item-text');
                const priceNode = clone.querySelector('.modal-item-price');
                if (textNode) textNode.textContent = li.textContent.trim();
                const price = li.dataset && li.dataset.price ? Number(li.dataset.price) : null;
                if (priceNode) priceNode.textContent = (price != null) ? '₱ ' + price.toFixed(2) : '';
                modalItemsContainer.appendChild(clone);
            });

            // total calculation
            if (card.dataset && card.dataset.total) {
                modalTotal.textContent = card.dataset.total;
            } else {
                let sum = 0;
                itemEls.forEach(li => {
                    const p = li.dataset && li.dataset.price ? parseFloat(li.dataset.price) : 0;
                    if (!isNaN(p)) sum += p;
                });
                modalTotal.textContent = sum ? '₱ ' + sum.toFixed(2) : '—';
            }

            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');

            if (modalCloseBtn) modalCloseBtn.focus();
        }

        function closeModal() {
            overlay.hidden = true;
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeModal);
        }
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !overlay.hidden) closeModal();
        });

        const statusButtons = document.querySelectorAll('.btn-status');
        statusButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.order-card');
                openOrderModalFromCard(card);
            });
        });
    })();

    // Profile image upload
    const uploadBtn = document.getElementById("upload-btn");
    const uploadInput = document.getElementById("upload-input");
    const profileIcon = document.getElementById("profile-icon");

    if (uploadBtn && uploadInput && profileIcon) {
        uploadBtn.addEventListener("click", () => {
            uploadInput.click();
        });

        uploadInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const img = document.createElement("img");
                img.src = URL.createObjectURL(file);

                profileIcon.innerHTML = "";
                profileIcon.appendChild(img);
            }
        });
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
                // Populate profile info
                const info = document.querySelector('.profile-card .info');
                info.querySelectorAll('p')[0].textContent = data.customer_name;
                info.querySelectorAll('p')[1].textContent = data.customer_email;
                info.querySelectorAll('p')[2].textContent = data.customer_contact;
            } else {
                // Not logged in, redirect to login
                window.location.href = 'login.html';
            }
        })
        .catch(err => console.error('Error fetching user data:', err));


    //fetch logged-in customer info (edit-account.html)
    fetch('../../database/user/getCustomerInfo.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
            // Only set values if inputs exist
                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const phoneInput = document.getElementById('phone');
                
                if (nameInput) nameInput.value = data.customer_name;
                if (emailInput) emailInput.value = data.customer_email;
                if (phoneInput) phoneInput.value = data.customer_contact;
            } else {
                window.location.href = 'login.html';
            }
        });

    // save updated info
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

            const formData = new URLSearchParams();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);

            fetch('../../database/user/updateCustomerInfo.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
            })
            .catch(err => console.error('Error updating account:', err));
        });
    }

    //for reset password in customer profile tab
    form.addEventListener("submit", function(e) {
        e.preventDefault(); // prevent default form submit

        const formData = new FormData(form);

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

});