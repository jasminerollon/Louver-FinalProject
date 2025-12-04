document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values directly from input elements
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            console.log('Sending login with username:', username, 'password:', password);

            // Clear previous error messages
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';

            // Validate inputs
            if (!username || !password) {
                showError('Please fill in all fields');
                return;
            }

            // Send login request
            fetch('http://localhost/louver-finalproject/database/admin/adminLogin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Login response:', data);
                if (data.status === 'success') {
                    // Redirect to admin homepage
                    window.location.href = data.redirect;
                } else {
                    showError(data.message || 'Login failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('An error occurred. Please try again.');
            });
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
