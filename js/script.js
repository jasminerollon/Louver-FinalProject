// JavaScript functionality can be added here
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for form submissions
    const signupForm = document.querySelector('.form-box');
    if (signupForm) {
        const signupBtn = signupForm.querySelector('.signup-btn');
        if (signupBtn && signupForm.querySelector('h3').textContent.includes('CREATE')) {
            signupBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Add signup logic here
                // Form validation and submission would go here
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
                // Form validation and submission would go here
            });
        }
    }

    // Navigation between pages - fixed paths
    const loginButtons = document.querySelectorAll('.login-btn');
    loginButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentPage = window.location.pathname;
            
            if (currentPage.includes('index.html') || currentPage === '/') {
                // From index.html
                if (this.textContent.includes('LOG IN')) {
                    window.location.href = 'html/login.html';
                } else if (this.textContent.includes('SIGN UP') || this.textContent.includes('GET STARTED')) {
                    window.location.href = 'html/signup.html';
                }
            } else if (currentPage.includes('html/')) {
                // From html folder files
                if (this.textContent.includes('LOG IN')) {
                    window.location.href = 'login.html';
                } else if (this.textContent.includes('SIGN UP')) {
                    window.location.href = 'signup.html';
                }
            }
        });
    });
});