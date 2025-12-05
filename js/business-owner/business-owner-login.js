    // Get modal elements
    const errorModal = document.getElementById("errorModal");
    const closeModalBtn = document.getElementById("closeModalBtn");

    // Show modal if PHP returned ?error=1
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === '1') {
        errorModal.style.display = 'flex'; // or 'block', depending on your CSS
    }

    // Close modal on button click
    closeModalBtn.addEventListener('click', () => {
        errorModal.style.display = 'none';
    });