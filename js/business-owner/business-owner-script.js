/** ============================
 *  ORDERS ⇆ REFUNDS TAB FILTER
 * ============================ */
const tabs = document.querySelectorAll(".tab");
const rows = document.querySelectorAll("tbody tr");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const selected = tab.textContent.trim().toLowerCase();

        rows.forEach(row => {
            const type = row.dataset.tab;

            if (selected === "orders" && type !== "refunds") {
                row.style.display = "";
            } else if (selected === "refunds" && type === "refunds") {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });
});