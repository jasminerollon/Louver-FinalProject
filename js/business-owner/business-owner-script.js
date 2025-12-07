/* ============================================================
   DOM ELEMENTS
============================================================ */
const tableBody = document.querySelector(".orders-table tbody");
const searchInputEl = document.querySelector(".search-wrapper input");
const tabs = document.querySelectorAll(".orders-tabs .tab");

let ordersData = [];
let refundsData = [];

/* ============================================================
   FETCH ORDERS & REFUNDS FROM PHP
============================================================ */
fetch("../../php/business-owner/fetch-business-orders.php")
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            ordersData = data.orders || [];
            refundsData = data.refunds || [];
            renderTable("orders"); // default tab
        }
    });

/* ============================================================
   RENDER TABLE
============================================================ */
function renderTable(tab) {
    tableBody.innerHTML = "";
    const data = tab === "refunds" ? refundsData : ordersData;

    data.forEach(order => {
        const row = document.createElement("tr");
        row.dataset.tab = tab;
        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.date_ordered}</td>
            <td>${order.customer_name}</td>
            <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
            <td>₱ ${order.total}</td>
            <td><button class="view-btn"><i class="fa fa-eye"></i> View</button></td>
        `;
        tableBody.appendChild(row);

        // Attach view button
        row.querySelector(".view-btn").addEventListener("click", () => {
            if (tab === "refunds") openModal("refundModal");
            else openModal("orderModal");
        });
    });
}

/* ============================================================
   SEARCH BY ORDER ID
============================================================ */
searchInputEl.addEventListener("input", () => {
    const query = searchInputEl.value.trim().toLowerCase();
    Array.from(tableBody.querySelectorAll("tr")).forEach(row => {
        const orderId = row.querySelector("td").textContent.trim().toLowerCase();
        row.style.display = orderId.includes(query) ? "" : "none";
    });
});

/* ============================================================
   TAB SWITCHING
============================================================ */
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const tabName = tab.innerText.toLowerCase().includes("refund") ? "refunds" : "orders";
        renderTable(tabName);
        searchInputEl.value = "";
    });
});

/* ============================================================
   MODAL HANDLER
============================================================ */
function openModal(id) {
    document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

function attachModalEvents(modalId, closeBtnId) {
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeBtnId);
    if (!modal) return;

    closeBtn?.addEventListener("click", () => closeModal(modalId));
    modal.addEventListener("click", e => {
        if (e.target.id === modalId) closeModal(modalId);
    });
}

// Attach modals
attachModalEvents("orderModal", "closeModalBtn");
attachModalEvents("refundModal", "closeRefundModal");
attachModalEvents("cancelOrderModal", "closeCancelModal");
attachModalEvents("reportModal", "closeReportModal");

// Cancel & Report buttons inside modal
document.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        closeModal("orderModal");
        openModal("cancelOrderModal");
    });
});
document.querySelectorAll(".report-btn").forEach(btn => {
    btn.addEventListener("click", () => openModal("reportModal"));
});