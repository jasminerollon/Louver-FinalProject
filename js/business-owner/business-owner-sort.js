document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------
    // SORT DROPDOWN — WORKS ON ANY PAGE
    // -----------------------------------------
    const sortBtn = document.getElementById("sortBtn");
    const sortOptions = document.getElementById("sortOptions");
    const sortValue = document.getElementById("sort-value");

    if (sortBtn && sortOptions && sortValue) {

        // Open/close
        sortBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sortOptions.style.display =
                sortOptions.style.display === "none" ? "block" : "none";
        });

        // Selecting an option
        document.querySelectorAll("#sortOptions li[data-sort]").forEach(option => {
            option.addEventListener("click", () => {
                sortValue.textContent = option.textContent;
                sortOptions.style.display = "none";
            });
        });

        // Close when clicking outside
        document.addEventListener("click", (e) => {
            if (!sortBtn.contains(e.target) && !sortOptions.contains(e.target)) {
                sortOptions.style.display = "none";
            }
        });
    }

});