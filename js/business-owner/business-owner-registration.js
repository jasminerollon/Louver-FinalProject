// BUSINESS OWNER REGISTRATION JS FILE
document.getElementById("business_permit").addEventListener("change", function() {
    let fileName = this.files.length ? this.files[0].name : "Upload Business Permit";
    document.getElementById("file-label").textContent = fileName;
});