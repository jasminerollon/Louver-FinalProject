document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------
    // PART 1 — ADD PRODUCT PAGE JS (Upload Preview)
    // -----------------------------------------
    const addProductForm = document.getElementById("addProductForm");
    const uploadInput = document.getElementById("product_image");
    const previewImage = document.getElementById("preview-image");

    if (uploadInput && previewImage) {
        const uploadBtn = document.querySelector(".upload-btn");

        if (uploadBtn) {
            uploadBtn.addEventListener("click", () => uploadInput.click());
        }

        uploadInput.addEventListener("change", () => {
            const file = uploadInput.files[0];
            if (file) {
                previewImage.src = URL.createObjectURL(file);
            }
        });

        // Handle Add Product Form Submit via AJAX
        addProductForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new FormData(addProductForm);

            fetch(addProductForm.action, {
                method: "POST",
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {

                        // Save flag so product page refreshes
                        localStorage.setItem("product_added", "true");

                        // Redirect back to product list
                        window.location.href = "../business-owner/business-owner-products.html";
                    } else {
                        alert("Failed to add product.");
                    }
                })
                .catch(err => console.error(err));
        });
    }

    // -----------------------------------------
    // PART 2 — PRODUCTS PAGE JS
    // -----------------------------------------
    const tableCard = document.querySelector(".table-card");

    // If we are NOT on products page, exit.
    if (!tableCard) return;

    // GLOBAL PRODUCT LIST (for search)
    let allProducts = [];

    // Remove static hard-coded products
    tableCard.querySelectorAll(".product-row, .divider").forEach(e => e.remove());


    // RENDER PRODUCTS
    function renderProducts(products) {

        // Clear old rows
        tableCard.querySelectorAll(".product-row, .divider").forEach(e => e.remove());

        if (products.length === 0) {
            const empty = document.createElement("div");
            empty.className = "product-row";
            empty.style.justifyContent = "center";
            empty.style.textAlign = "center";
            empty.innerHTML = `<div style="flex:1; padding:16px; font-weight:500;">No matching products found.</div>`;
            tableCard.appendChild(empty);
            return;
        }

        products.forEach((product, index) => {
            const row = document.createElement("div");
            row.className = "product-row";

            const primarySrc = product.image
                ?  `../../assets/pictures/businessphotos/${product.image}`
                : `../../assets/pictures/default-food.png`;

            row.innerHTML = `
                <img src="${primarySrc}" class="prod-img" onerror="this.src='../../assets/pictures/default-food.png'">

                <div class="prod-name">${product.NAME}</div>

                <div class="prod-desc">${product.description || ''}</div>

                <div class="prod-price">₱ ${parseFloat(product.price).toFixed(2)}</div>

                <div class="prod-edit">
                    <img src="../../assets/pictures/modify.png" class="edit-icon" data-id="${product.product_id}">
                </div>
            `;

            const divider = document.createElement("div");
            divider.className = "divider";

            tableCard.appendChild(row);
            tableCard.appendChild(divider);
        });

        attachEditButtons();
    }


    // FETCH PRODUCTS FROM PHP
    function fetchProducts() {
        fetch("../../database/business-owner/businessFetchProducts.php")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.products)) {

                    // Save products for search filtering
                    allProducts = data.products;

                    if (allProducts.length === 0) {
                        tableCard.querySelectorAll(".product-row, .divider").forEach(e => e.remove());
                        const empty = document.createElement("div");
                        empty.className = "product-row";
                        empty.style.justifyContent = "center";
                        empty.style.textAlign = "center";
                        empty.innerHTML = `<div style="flex:1; padding:16px; font-weight:500;">No products yet. Click \"Add Product\" to create your first item.</div>`;
                        tableCard.appendChild(empty);
                    } else {
                        renderProducts(allProducts);
                    }
                } else {
                    console.error("Fetch failed", data);
                }
            })
            .catch(err => console.error(err));
    }


    // ADD CLICK LISTENER TO EVERY EDIT BUTTON
    function attachEditButtons() {
        const icons = document.querySelectorAll(".edit-icon");

        icons.forEach(icon => {
            icon.addEventListener("click", () => {
                const productID = icon.getAttribute("data-id");
                window.location.href = `business-owner-edit-products.html?id=${productID}`;
            });
        });
    }


    // REFRESH IF WE JUST ADDED A PRODUCT
    if (localStorage.getItem("product_added") === "true") {
        localStorage.removeItem("product_added");
        fetchProducts();
    } else {
        fetchProducts();
    }

    // -----------------------------------------
    // PART 3 — SEARCH FUNCTIONALITY
    // -----------------------------------------
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", () => {

            const keyword = searchInput.value.toLowerCase().trim();

            const filtered = allProducts.filter(product =>
                product.NAME.toLowerCase().includes(keyword)
            );

            renderProducts(filtered);
        });
    }

});