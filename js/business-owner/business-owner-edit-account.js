document.addEventListener("DOMContentLoaded", () => {
    console.log("Edit Account JS loaded");
    
    const businessName = document.getElementById("business_name");
    const ownerName = document.getElementById("owner_name");
    const email = document.getElementById("email");
    const contactNumber = document.getElementById("contact_number");
    const address = document.getElementById("address");
    const businessPermit = document.getElementById("business_permit");

    const profileImg = document.getElementById("profile-img");
    const profilePreview = document.getElementById("profile-img-preview");
    const changeProfileBtn = document.getElementById("change-profile-btn");

    const bannerImg = document.getElementById("banner-img");
    const bannerPreview = document.getElementById("banner-img-preview");
    const changeBannerBtn = document.getElementById("change-banner-btn");

    const modal = document.getElementById("notification-modal");
    const modalMessage = document.getElementById("notification-message");
    const modalOk = document.getElementById("notification-ok-btn");

    // Fetch vendor data
    console.log("Fetching vendor data...");
    fetch("../../database/business-owner/editAccount.php?fetch=true", {
        credentials: 'same-origin'
    })
    .then(res => {
        console.log("Response status:", res.status);
        if (!res.ok) {
            throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("Fetched data:", data);
        
        if (data.success === false) {
            console.error("Fetch failed:", data.message);
            alert(data.message || "Failed to fetch profile data");
            return;
        }
        
        // Populate form fields
        businessName.value = data.business_name || "";
        ownerName.value = data.owner_name || "";
        email.value = data.email || "";
        contactNumber.value = data.contact_number || "";
        address.value = data.address || "";
        
        // Set image previews
        if (data.profile_image && data.profile_image !== "null" && data.profile_image !== "") {
            profilePreview.src = `../../assets/pictures/${data.profile_image}`;
        }
        
        if (data.banner_image && data.banner_image !== "null" && data.banner_image !== "") {
            bannerPreview.src = `../../assets/pictures/${data.banner_image}`;
        }
        
        console.log("Form populated successfully");
    })
    .catch(error => {
        console.error("Fetch error:", error);
        alert("Failed to load profile data. Please refresh the page.");
    });

    // File pickers
    changeProfileBtn.addEventListener("click", () => {
        console.log("Opening profile image picker");
        profileImg.click();
    });
    
    changeBannerBtn.addEventListener("click", () => {
        console.log("Opening banner image picker");
        bannerImg.click();
    });

    profileImg.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
            console.log("Profile image selected:", file.name);
            if (!file.type.match('image.*')) {
                alert("Please select an image file (JPG, PNG, etc.)");
                return;
            }
            profilePreview.src = URL.createObjectURL(file);
        }
    });

    bannerImg.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
            console.log("Banner image selected:", file.name);
            if (!file.type.match('image.*')) {
                alert("Please select an image file (JPG, PNG, etc.)");
                return;
            }
            bannerPreview.src = URL.createObjectURL(file);
        }
    });

    // Save changes
    document.getElementById("save-btn").addEventListener("click", () => {
        console.log("Save button clicked");
        
        // Validate required fields
        if (!businessName.value.trim()) {
            alert("Business name is required");
            return;
        }
        
        if (!ownerName.value.trim()) {
            alert("Owner name is required");
            return;
        }
        
        if (!email.value.trim()) {
            alert("Email is required");
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            alert("Please enter a valid email address");
            return;
        }

        const formData = new FormData();
        formData.append("business_name", businessName.value);
        formData.append("owner_name", ownerName.value);
        formData.append("email", email.value);
        formData.append("contact_number", contactNumber.value);
        formData.append("address", address.value);
        
        console.log("Form data prepared:", {
            business_name: businessName.value,
            owner_name: ownerName.value,
            email: email.value,
            contact_number: contactNumber.value,
            address: address.value
        });
        
        if (profileImg.files[0]) {
            console.log("Adding profile image:", profileImg.files[0].name);
            formData.append("profile_image", profileImg.files[0]);
        }
        
        if (bannerImg.files[0]) {
            console.log("Adding banner image:", bannerImg.files[0].name);
            formData.append("banner_image", bannerImg.files[0]);
        }
        
        if (businessPermit.files[0]) {
            const permitFile = businessPermit.files[0];
            console.log("Adding business permit:", permitFile.name);
            
            // Validate file type for business permit
            const validPermitTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!validPermitTypes.includes(permitFile.type)) {
                alert("Business permit must be PDF, JPG, or PNG");
                return;
            }
            formData.append("business_permit", permitFile);
        }

        console.log("Submitting to PHP...");
        
        fetch("../../database/business-owner/editAccount.php", {
            method: "POST",
            body: formData,
            credentials: 'same-origin'
        })
        .then(res => {
            console.log("Save response status:", res.status);
            if (!res.ok) {
                throw new Error(`Save failed: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Save response data:", data);
            
            modalMessage.textContent = data.message || (data.success ? "Profile updated successfully" : "Update failed");
            modal.style.display = "flex";
            
            modalOk.onclick = () => {
                modal.style.display = "none";
                if (data.success) {
                    console.log("Redirecting to account page...");
                    window.location.href = "business-owner-account.html";
                }
            };
        })
        .catch(error => {
            console.error("Save error:", error);
            modalMessage.textContent = "Failed to save changes. Please try again.";
            modal.style.display = "flex";
            modalOk.onclick = () => {
                modal.style.display = "none";
            };
        });
    });

    // Cancel button
    document.getElementById("cancel-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to cancel? Unsaved changes will be lost.")) {
            window.location.href = "business-owner-account.html";
        }
    });
});