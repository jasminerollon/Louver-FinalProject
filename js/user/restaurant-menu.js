// Global variables
let vendorData = null;
let allMenuItems = [];
let currentProduct = null;
let currentQuantity = 1;

document.addEventListener('DOMContentLoaded', function() {
    // Get vendor_id from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const vendorId = urlParams.get('vendor_id');
    
    if (!vendorId) {
        alert('No restaurant selected');
        window.location.href = 'customer-homepage.html';
        return;
    }
    
    // Load vendor profile and menu
    loadVendorProfile(vendorId);
    
    // Setup cart click handler
    setupCartHandler();
    
    // Setup search functionality
    setupSearchHandler();
});

// Load vendor profile and menu from API
function loadVendorProfile(vendorId) {
    fetch(`../../database/user/getVendorProfile.php?vendor_id=${vendorId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                window.location.href = 'customer-homepage.html';
                return;
            }
            
            vendorData = data;
            displayVendorInfo(data.vendor);
            
            if (data.hasProducts && Object.keys(data.menu).length > 0) {
                displayMenu(data.menu);
                setupCategoryTabs(data.menu);
            } else {
                displayNoProducts();
            }
        })
        .catch(error => {
            console.error('Error loading vendor profile:', error);
            alert('Failed to load restaurant menu');
        });
}

// Display vendor information
function displayVendorInfo(vendor) {
    document.getElementById('restaurantName').textContent = vendor.business_name;
    const logoImg = document.getElementById('restaurantImage');
    logoImg.src = `../../assets/pictures/${vendor.profile_image}`;
    logoImg.alt = vendor.business_name;
    logoImg.onerror = function() {
        this.src = '../../assets/pictures/default.png';
    };
    document.getElementById('estimatedTime').textContent = vendor.estimated_time || '10 mins';
    document.getElementById('locationDetail').textContent = vendor.location_detail || vendor.address;
    
    if (vendor.description) {
        document.getElementById('restaurantDescription').textContent = vendor.description;
    } else {
        document.getElementById('restaurantDescription').style.display = 'none';
    }
    
    // Set modal restaurant name
    document.getElementById('modalRestaurantName').textContent = vendor.business_name;
}

// Display menu items
function displayMenu(menu) {
    const menuContent = document.getElementById('menuContent');
    menuContent.innerHTML = '';
    allMenuItems = [];
    
    // Check if menu is empty
    if (!menu || Object.keys(menu).length === 0) {
        displayNoProducts();
        return;
    }
    
    // Sort categories to show Popular first
    const categories = Object.keys(menu).sort((a, b) => {
        if (a === 'Popular') return -1;
        if (b === 'Popular') return 1;
        return a.localeCompare(b);
    });
    
    categories.forEach(category => {
        const items = menu[category];
        
        const categorySection = document.createElement('div');
        categorySection.className = 'menu-category';
        categorySection.id = `category-${category.replace(/\s+/g, '-').toLowerCase()}`;
        
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category;
        categorySection.appendChild(categoryTitle);
        
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'menu-items';
        
        items.forEach(item => {
            allMenuItems.push({ ...item, category });
            
            const itemCard = document.createElement('div');
            itemCard.className = 'menu-item';
            itemCard.onclick = () => openProductModal(item);
            
            itemCard.innerHTML = `
                <img src="../../assets/pictures/${item.image}" alt="${item.NAME}" class="menu-item-image" onerror="this.src='../../assets/pictures/default-food.png'">
                <div class="menu-item-info">
                    <h3>${item.NAME}</h3>
                    <p class="menu-item-price">₱ ${parseFloat(item.price).toFixed(2)}</p>
                    <button class="add-item-btn" onclick="event.stopPropagation(); openProductModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">+</button>
                </div>
            `;
            
            itemsGrid.appendChild(itemCard);
        });
        
        categorySection.appendChild(itemsGrid);
        menuContent.appendChild(categorySection);
    });
}

// Display no products message
function displayNoProducts() {
    const menuContent = document.getElementById('menuContent');
    menuContent.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin-bottom: 1.5rem;">
                <circle cx="40" cy="40" r="38" stroke="#ddd" stroke-width="4"/>
                <path d="M35 25h10M40 25v30M25 40l15 15 15-15" stroke="#999" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 style="color: #8B0000; font-size: 1.8rem; margin-bottom: 1rem;">Menu Coming Soon</h2>
            <p style="color: #666; font-size: 1.1rem; max-width: 500px; margin: 0 auto;">
                This restaurant is setting up their menu. Please check back later for delicious food options!
            </p>
        </div>
    `;
    
    // Hide search and category tabs
    const menuControls = document.querySelector('.menu-controls');
    if (menuControls) {
        menuControls.style.display = 'none';
    }
}

// Setup category tabs
function setupCategoryTabs(menu) {
    const tabsContainer = document.getElementById('categoryTabs');
    tabsContainer.innerHTML = '';
    
    if (!menu || Object.keys(menu).length === 0) {
        return;
    }
    
    // Sort categories to show Popular first
    const categories = Object.keys(menu).sort((a, b) => {
        if (a === 'Popular') return -1;
        if (b === 'Popular') return 1;
        return a.localeCompare(b);
    });
    
    categories.forEach((category, index) => {
        const tab = document.createElement('button');
        tab.className = 'category-tab';
        if (index === 0) tab.classList.add('active');
        tab.textContent = category;
        tab.onclick = () => scrollToCategory(category, tab);
        tabsContainer.appendChild(tab);
    });
}

// Scroll to category section
function scrollToCategory(category, clickedTab) {
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    clickedTab.classList.add('active');
    
    // Scroll to category
    const categoryId = `category-${category.replace(/\s+/g, '-').toLowerCase()}`;
    const element = document.getElementById(categoryId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Open product modal
function openProductModal(product) {
    currentProduct = product;
    currentQuantity = 1;
    
    document.getElementById('modalProductName').textContent = product.NAME;
    document.getElementById('modalProductPrice').textContent = `₱ ${parseFloat(product.price).toFixed(2)}`;
    document.getElementById('modalProductDescription').textContent = product.description || 'No description available';
    document.getElementById('modalProductImage').src = `../../assets/pictures/${product.image}`;
    document.getElementById('modalProductImage').alt = product.NAME;
    document.getElementById('quantityValue').textContent = currentQuantity;
    
    document.getElementById('productModal').style.display = 'flex';
}

// Close product modal
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    currentProduct = null;
    currentQuantity = 1;
}

// Increase quantity
function increaseQuantity() {
    currentQuantity++;
    document.getElementById('quantityValue').textContent = currentQuantity;
}

// Decrease quantity
function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('quantityValue').textContent = currentQuantity;
    }
}

// Add to cart
function addToCart() {
    if (!currentProduct) return;
    
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.product_id === currentProduct.product_id && 
        item.vendor_id === vendorData.vendor.vendor_id
    );
    
    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].quantity += currentQuantity;
    } else {
        // Add new item
        cart.push({
            product_id: currentProduct.product_id,
            vendor_id: vendorData.vendor.vendor_id,
            vendor_name: vendorData.vendor.business_name,
            product_name: currentProduct.NAME,
            price: parseFloat(currentProduct.price),
            quantity: currentQuantity,
            image: currentProduct.image
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show feedback
    alert(`Added ${currentQuantity} × ${currentProduct.NAME} to cart!`);
    
    // Close modal
    closeProductModal();
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Setup cart click handler
function setupCartHandler() {
    const cartElement = document.querySelector('.cart');
    if (cartElement) {
        cartElement.addEventListener('click', function() {
            window.location.href = 'customer-cart.html';
        });
        cartElement.style.cursor = 'pointer';
    }
    
    // Initialize cart count
    updateCartCount();
}

// Setup search handler
function setupSearchHandler() {
    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterMenuItems(searchTerm);
        });
    }
}

// Filter menu items based on search
function filterMenuItems(searchTerm) {
    if (!vendorData || !vendorData.menu) return;
    
    if (searchTerm === '') {
        // Show all items
        displayMenu(vendorData.menu);
        return;
    }
    
    // Filter items
    const filteredMenu = {};
    
    Object.keys(vendorData.menu).forEach(category => {
        const filteredItems = vendorData.menu[category].filter(item => 
            item.NAME.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
        
        if (filteredItems.length > 0) {
            filteredMenu[category] = filteredItems;
        }
    });
    
    displayMenu(filteredMenu);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        closeProductModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});
