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

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');

// Open file dialog when clicking the upload area
uploadArea.addEventListener('click', () => fileInput.click());

// Handle file selection
fileInput.addEventListener('change', () => {
    displayFiles(fileInput.files);
});

// Optional: handle drag and drop
uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.style.background = "#f8dede";
});

uploadArea.addEventListener('dragleave', e => {
    e.preventDefault();
    uploadArea.style.background = "";
});

uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.background = "";
    displayFiles(e.dataTransfer.files);
});

function displayFiles(files) {
    uploadPreview.innerHTML = ""; // clear previous
    Array.from(files).forEach(file => {
        const fileType = file.type.split('/')[0];
        const reader = new FileReader();
        
        reader.onload = e => {
            let element;
            if (fileType === "image") {
                element = document.createElement("img");
                element.src = e.target.result;
            } else if (fileType === "video") {
                element = document.createElement("video");
                element.src = e.target.result;
                element.controls = true;
            }
            uploadPreview.appendChild(element);
        };
        reader.readAsDataURL(file);
    });
}
