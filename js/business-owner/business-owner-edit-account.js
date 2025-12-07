document.addEventListener("DOMContentLoaded", () => {
    const businessName = document.getElementById("business_name");
    const ownerName = document.getElementById("owner_name");
    const email = document.getElementById("email");
    const contactNumber = document.getElementById("contact_number");
    const location = document.getElementById("location");
    const businessNumber = document.getElementById("business_number");

    const profileImg = document.getElementById("profile-img");
    const profilePreview = document.getElementById("profile-img-preview");
    const changeProfileBtn = document.getElementById("change-profile-btn");

    const bannerImg = document.getElementById("banner-img");
    const bannerPreview = document.getElementById("banner-img-preview");
    const changeBannerBtn = document.getElementById("change-banner-btn");

    const modal = document.getElementById("notification-modal");
    const modalMessage = document.getElementById("notification-message");
    const modalOk = document.getElementById("notification-ok-btn");

    // Fetch current data from server
    fetch("../../database/business-owner/editAccount.php?fetch=true")
        .then(res => res.json())
        .then(data => {
            businessName.value = data.business_name || "";
            ownerName.value = data.owner_name || "";
            email.value = data.email || "";
            contactNumber.value = data.contact_number || "";
            location.value = data.location_detail || "";
            businessNumber.value = data.address || "";

            if (data.profile_image) profilePreview.src = `../../assets/pictures/${data.profile_image}`;
            if (data.banner_image) bannerPreview.src = `../../assets/pictures/${data.banner_image}`;
        });

    // Buttons to open file pickers
    changeProfileBtn.addEventListener("click", () => profileImg.click());
    changeBannerBtn.addEventListener("click", () => bannerImg.click());

    // File input change -> update preview
    profileImg.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) profilePreview.src = URL.createObjectURL(file);
    });

    bannerImg.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) bannerPreview.src = URL.createObjectURL(file);
    });

    // Save changes
    document.getElementById("save-btn").addEventListener("click", () => {
        const formData = new FormData();
        formData.append("business_name", businessName.value);
        formData.append("owner_name", ownerName.value);
        formData.append("email", email.value);
        formData.append("contact_number", contactNumber.value);
        formData.append("location", location.value);
        formData.append("business_number", businessNumber.value);

        if (profileImg.files[0]) formData.append("profile_image", profileImg.files[0]);
        if (bannerImg.files[0]) formData.append("banner_image", bannerImg.files[0]);

        fetch("../../database/business-owner/editAccount.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            modalMessage.textContent = data.message;
            modal.style.display = "flex";

            modalOk.onclick = () => {
                modal.style.display = "none";
                if (data.success) window.location.href = "business-owner-account.html";
            };
        });
    });

    // Cancel button
    document.getElementById("cancel-btn").addEventListener("click", () => {
        window.location.href = "business-owner-account.html";
    });
});
