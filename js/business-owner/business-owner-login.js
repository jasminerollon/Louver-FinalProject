document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const errorModal = document.getElementById("errorModal");
    const closeModalBtn = document.getElementById("closeModalBtn");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        fetch("../../database/business-owner/business-owner-newLogin.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Redirect on success
                window.location.href = "../../html/business-owner/business-owner-products.html";
            } else {
                // Show modal
                errorModal.style.display = "flex";
            }
        })
        .catch(err => console.error(err));
    });

    closeModalBtn.addEventListener("click", () => {
        errorModal.style.display = "none";
    });
});