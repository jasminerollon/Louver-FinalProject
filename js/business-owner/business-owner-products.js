document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------
    // Add Product Page Functionality
    // -------------------------------
    const addProductForm = document.getElementById("addProductForm");
    const uploadInput = document.getElementById("product_image");
    const previewImage = document.getElementById("preview-image");

    if (uploadInput && previewImage) {
        const uploadBtn = document.querySelector(".upload-btn");
        if(uploadBtn){
            uploadBtn.addEventListener("click", () => uploadInput.click());
        }

        uploadInput.addEventListener("change", () => {
            const file = uploadInput.files[0];
            if(file) previewImage.src = URL.createObjectURL(file);
        });
    }

    // -------------------------------
    // Products Page Functionality
    // -------------------------------
   document.addEventListener("DOMContentLoaded", () => {
    const tableCard = document.querySelector("table-card");

    if (!tableCard) return;

    function renderProducts(products) {
        tableCard.innerHTML = ""; // Clear existing rows

        products.forEach((product, index) => {
            const row = document.createElement("div");
            row.className = "product-row";
            row.innerHTML = `
                <div class="col image-col">
                    <img src="../../uploads\permits/${product.image || 'default.png'}" class="prod-img">
                </div>
                <div class="col name-col">${index + 1} - ${product.NAME}</div>
                <div class="col desc-col">${product.description}</div>
                <div class="col price-col">₱ ${parseFloat(product.price).toFixed(2)}</div>
                <div class="col edit-col">
                    <img src="../../assets/pictures/modify.png" class="edit-icon">
                </div>
            `;
            const divider = document.createElement("div");
            divider.className = "divider";

            tableCard.appendChild(row);
            tableCard.appendChild(divider);
        });
    }

    function fetchProducts() {
        fetch("../../database/business-owner/fetch-products.php")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.products)) {
                    renderProducts(data.products); // Renders all products
                } else {
                    console.error("Failed to fetch products", data);
                }
            })
            .catch(err => console.error(err));
    }

    fetchProducts();
});

});