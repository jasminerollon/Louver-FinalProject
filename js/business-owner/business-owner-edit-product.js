document.addEventListener("DOMContentLoaded", () => {
    const cancelBtn = document.querySelector(".cancel-btn");
    const deleteBtn = document.querySelector(".delete-btn");
    const saveBtn = document.querySelector(".save-btn");
    const uploadBtn = document.querySelector(".upload-btn");

    const productImage = document.querySelector(".product-image");
    const nameInput = document.querySelector(".form-fields input[type='text']");
    const descriptionInput = document.querySelector(".form-fields textarea");
    const priceInput = document.querySelector(".form-fields input[type='text']:nth-of-type(2)");

    // Get product id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    let selectedFile = null; // store the real File object
    let existingImagePath = "../../assets/pictures/businessphotos/"; // store existing database image path

    // Load product data
   if (productId) {
    fetch(`../../database/business-owner/businessEditProduct.php?id=${productId}`)
        .then(res => res.json())
        .then(data => {
            if (!data.error) {
                // Set the product image with correct path
                if (data.image) {
                    productImage.src = `../../assets/pictures/businessphotos/${data.image}`;
                } else {
                    productImage.src = "../../assets/pictures/default-food.png";
                }
                productImage.onerror = function() {
                    this.src = "../../assets/pictures/default-food.png";
                };

                // Fill in the form fields
                nameInput.value = data.name;
                descriptionInput.value = data.description;
                priceInput.value = data.price;

                // Store existing image path for saving if no new image is uploaded
                existingImagePath = data.image || "";
            } else {
                alert(data.error);
            }
        });
}

    // Upload image preview
    uploadBtn.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.click();

        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];
            if (file) {
                selectedFile = file; // store File object
                const reader = new FileReader();
                reader.onload = e => productImage.src = e.target.result; // preview
                reader.readAsDataURL(file);
            }
        });
    });

    // Cancel button
    cancelBtn.addEventListener("click", () => {
        window.location.href = "../../html/business-owner/business-owner-products.html";
    });

    // Delete button
    deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this product?")) {
            const formData = new FormData();
            formData.append("delete", true);

            fetch(`../../database/business-owner/businessEditProduct.php?id=${productId}`, {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(() => {
                window.location.href = "../../html/business-owner/business-owner-products.html";
            });
        }
    });

    // Save changes
    saveBtn.addEventListener("click", () => {
        const formData = new FormData();
        formData.append("name", nameInput.value);
        formData.append("description", descriptionInput.value);
        formData.append("price", priceInput.value);

        // Append image only if a new file is selected
        if (selectedFile) {
            formData.append("image", selectedFile);
        } else {
            // Keep existing image path
            formData.append("existing_image", existingImagePath);
        }

        fetch(`../../database/business-owner/businessEditProduct.php?id=${productId}`, {
            method: "POST",
            body: formData,
            headers: { "X-Requested-With": "XMLHttpRequest" }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Product updated successfully!");
                window.location.href = "../../html/business-owner/business-owner-products.html";
            } else {
                alert("Error updating product.");
            }
        });
    });
});
