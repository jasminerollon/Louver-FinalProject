// JavaScript functionality can be added here
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for form submissions
    const signupForm = document.querySelector('.form-box');
    if (signupForm) {
        const signupBtn = signupForm.querySelector('.signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Add signup logic here
                alert('Sign up functionality would be implemented here');
            });
        }
    }

    // Login form functionality
    const loginForm = document.querySelector('.form-box');
    if (loginForm && loginForm.querySelector('h3').textContent.includes('LOGIN')) {
        const loginBtn = loginForm.querySelector('.signup-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Add login logic here
                alert('Login functionality would be implemented here');
            });
        }
    }

    // Navigation between pages
    const loginButtons = document.querySelectorAll('.login-btn');
    loginButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent.includes('LOG IN')) {
                window.location.href = 'html/login.html';
            } else if (this.textContent.includes('SIGN UP')) {
                window.location.href = 'html/signup.html';
            }
        });
    });
});