// ORDER MODAL

// Select modal elements
const modal = document.getElementById("orderModal");
const closeBtn = document.getElementById("closeModalBtn");

// ALL view buttons in table
document.querySelectorAll(".view-btn").forEach(button => {
    button.addEventListener("click", () => {
        modal.style.display = "flex";
    });
});

// Close modal with X button
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close modal when clicking outside of modal box
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// Close modal with CANCEL ORDER button
document.querySelector(".cancel-btn").addEventListener("click", () => {
    modal.style.display = "none";
});


// REPORT MODAL

const reportModal = document.getElementById("reportModal");

// Open Report Modal
document.querySelector(".report-btn").addEventListener("click", () => {
    reportModal.style.display = "flex";
});

// Open file picker when upload box is clicked
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");

uploadBox.addEventListener("click", () => {
    fileInput.click();
});

// show file name after selection
fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        uploadBox.querySelector("p").textContent = fileInput.files[0].name;
    }
});

// Close report modal with X button
document.getElementById("closeReportModal").addEventListener("click", () => {
    reportModal.style.display = "none";
});

// Close report modal when clicking outside
reportModal.addEventListener("click", (e) => {
    if (e.target.id === "reportModal") {
        reportModal.style.display = "none";
    }
});

// Close report modal with CANCEL REPORT button
document.querySelector(".cancel-report").addEventListener("click", () => {
    reportModal.style.display = "none";
});

// Close report modal with CONFIRM REPORT button
document.querySelector(".confirm-report").addEventListener("click", () => {
    reportModal.style.display = "none";
});


// OPEN CANCEL ORDER MODAL
document.querySelector(".cancel-btn").addEventListener("click", () => {
    document.getElementById("cancelOrderModal").classList.add("active");
});

// CLOSE WITH CANCEL BUTTON
document.getElementById("closeCancelModal").addEventListener("click", () => {
    document.getElementById("cancelOrderModal").classList.remove("active");
});

// CLOSE WHEN CLICKING OUTSIDE MODAL
document.getElementById("cancelOrderModal").addEventListener("click", (e) => {
    if (e.target.id === "cancelOrderModal") {
        document.getElementById("cancelOrderModal").classList.remove("active");
    }
});



// ORDERS ⇆ REFUNDS TAB FILTER
const tabs = document.querySelectorAll(".tab");
const rows = document.querySelectorAll("tbody tr");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        // Switch active tab
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const selected = tab.dataset.tab;

        // Filter rows
        rows.forEach(row => {
            row.style.display =
                row.dataset.tab === selected ? "" : "none";
        });
    });
});
