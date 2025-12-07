document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("passwordForm");
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-password");
    const profileImg = document.getElementById("business-profile-img");

    // Notification modal
    const modal = document.createElement("div");
    modal.id = "notification-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
        <div class="report-modal">
            <p id="notification-message"></p>
            <div class="report-buttons">
                <button class="confirm-report" id="notification-ok-btn">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalMessage = document.getElementById("notification-message");
    const modalOk = document.getElementById("notification-ok-btn");
    modalOk.onclick = () => { modal.style.display = "none"; };

    // Fetch vendor profile image
    fetch("../../database/business-owner/editAccount.php?fetch=true")
        .then(res => res.json())
        .then(data => {
            if(data.profile_image) {
                profileImg.src = `../../assets/pictures/${data.profile_image}`;
            }
        })
        .catch(err => console.error("Failed to load profile image", err));

    // Handle form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (newPassword.value !== confirmPassword.value) {
            modalMessage.textContent = "Passwords do not match!";
            modal.style.display = "flex";
            return;
        }

        const formData = new FormData(form);

        fetch("../../database/business-owner/updateBusinessPassword.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            modalMessage.textContent = data.message;
            modal.style.display = "flex";
            if(data.success) {
                // Clear password fields
                newPassword.value = "";
                confirmPassword.value = "";

                // Redirect after a short delay
                setTimeout(() => {
                    // Add a query param to show success notification on profile page
                    window.location.href = "business-owner-account.html?passwordUpdated=1";
                }, 1500); // 1.5 seconds to show modal
            }
        })
        .catch(err => {
            modalMessage.textContent = "An error occurred. Please try again.";
            modal.style.display = "flex";
            console.error(err);
        });
    });
});
