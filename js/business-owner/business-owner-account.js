document.addEventListener("DOMContentLoaded", () => {

    fetch("../../database/business-owner/business-owner-account.php")
        .then(res => res.json())
        .then(data => {

            if (data.error) {
                console.error("Error:", data.error);
                return;
            }

            document.getElementById("businessName").textContent = data.business_name;
            document.getElementById("businessID").textContent = data.vendor_id;
            document.getElementById("email").textContent = data.email;
            document.getElementById("location").textContent = data.address;
            document.getElementById("contact").textContent = data.contact_number;
            document.getElementById("ownerName").textContent = data.owner_name;

            // PROFILE IMAGE: show default if null, empty, or "default.png"
            const profileImg = (!data.profile_image || data.profile_image === "default.png")
                ? "../../assets/pictures/default.png"
                : "../../assets/pictures/" + data.profile_image;

            document.getElementById("profileImage").src = profileImg;

            // BANNER IMAGE: show default if missing
            const bannerImg = (!data.banner_image || data.banner_image === "default_banner.jpg")
                ? "../../assets/pictures/banner_default.jpg"
                : "../../assets/pictures/" + data.banner_image;

            document.getElementById("bannerImage").src = bannerImg;

            // BUSINESS PERMIT
            document.getElementById("viewPermit").href =
                "../../assets/files/" + data.business_permit;

        })
        .catch(err => console.error("Fetch error:", err));
});
