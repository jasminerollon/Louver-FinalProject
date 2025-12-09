document.addEventListener("DOMContentLoaded", () => {
    console.log("Account page loaded");

    // Logout functionality
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to log out?")) {
                // You can add logout API call here if needed
                window.location.href = "../../html/business-owner/business-owner-login.html";
            }
        });
    }

    // Fetch vendor data
    fetch("../../database/business-owner/business-owner-account.php", {
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

        if (data.error) {
            console.error("Error:", data.error);
            alert("Failed to load profile data. Please login again.");
            window.location.href = "../../html/business-owner/business-owner-login.html";
            return;
        }

        // Populate all fields
        document.getElementById("businessName").textContent = data.business_name || "Not set";
        document.getElementById("businessID").textContent = data.vendor_id || "Not set";
        document.getElementById("email").textContent = data.email || "Not set";
        document.getElementById("location").textContent = data.address || "Not set";
        document.getElementById("contact").textContent = data.contact_number || "Not set";
        document.getElementById("ownerName").textContent = data.owner_name || "Not set";

        // PROFILE IMAGE
        let profileImgSrc = "../../assets/pictures/default.png";
        if (data.profile_image && data.profile_image !== "null" && data.profile_image !== "" && data.profile_image !== "default.png") {
            profileImgSrc = `../../assets/pictures/${data.profile_image}`;
        }
        document.getElementById("profileImage").src = profileImgSrc;

        // BANNER IMAGE
        let bannerImgSrc = "../../assets/pictures/banner_default.jpg";
        if (data.banner_image && data.banner_image !== "null" && data.banner_image !== "" && data.banner_image !== "banner_default.jpg") {
            bannerImgSrc = `../../assets/pictures/${data.banner_image}`;
        }
        document.getElementById("bannerImage").src = bannerImgSrc;

        // BUSINESS PERMIT - Update the view button
        const viewPermitLink = document.getElementById("viewPermit");
        const viewBtn = viewPermitLink.querySelector('.view-btn');
        
        if (data.business_permit && data.business_permit !== "null" && data.business_permit !== "") {
            // Create URL for viewing permit
            const permitUrl = `../../database/business-owner/business-owner-account.php?permit=view`;
            
            // Update link
            viewPermitLink.href = permitUrl;
            viewPermitLink.onclick = (e) => {
                e.preventDefault(); // Prevent default navigation
                
                // Open in new tab for viewing
                const newWindow = window.open(permitUrl, '_blank');
                if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                    // If popup blocked, download directly
                    window.location.href = permitUrl;
                }
            };
            
            // Also add a download button
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-btn';
            downloadBtn.innerHTML = '<i class="download-icon"></i> Download';
            downloadBtn.onclick = (e) => {
                e.preventDefault();
                // Force download
                const downloadLink = document.createElement('a');
                downloadLink.href = permitUrl + '&download=1';
                downloadLink.download = data.business_permit;
                downloadLink.click();
            };
            
            // Add to permit buttons container
            const permitButtons = document.querySelector('.permit-buttons');
            permitButtons.style.display = 'flex';
            permitButtons.style.gap = '10px';
            permitButtons.style.alignItems = 'center';
            
            // Remove old button if exists
            const oldDownloadBtn = permitButtons.querySelector('.download-btn');
            if (oldDownloadBtn) oldDownloadBtn.remove();
            
            permitButtons.appendChild(downloadBtn);
            
            viewBtn.textContent = "View Permit";
        } else {
            viewPermitLink.style.display = "none";
            const permitButtons = document.querySelector('.permit-buttons');
            if (permitButtons) {
                permitButtons.innerHTML = '<span style="color: #666; font-style: italic;">No permit uploaded</span>';
            }
        }

        console.log("Profile data loaded successfully");
    })
    .catch(error => {
        console.error("Fetch error:", error);
        alert("Failed to load profile data. Please try again.");
    });
});