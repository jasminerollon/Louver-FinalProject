document.addEventListener('DOMContentLoaded', function() {
    // Event listeners for form submissions
    const signupForm = document.querySelector('.form-box');
    if (signupForm) {
        const signupBtn = signupForm.querySelector('.signup-btn');
        if (signupBtn && signupForm.querySelector('h3').textContent.includes('CREATE')) {
            signupBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // signup logic
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
                // login logic
                alert('Login functionality would be implemented here');
            });
        }
    }

    // Reset password form functionality
    const resetForm = document.querySelector('.form-box');
    if (resetForm && resetForm.querySelector('h3').textContent.includes('RESET')) {
        const resetBtn = resetForm.querySelector('.signup-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const email = resetForm.querySelector('input[type="email"]').value;
                const newPassword = resetForm.querySelectorAll('input[type="password"]')[0].value;
                const confirmPassword = resetForm.querySelectorAll('input[type="password"]')[1].value;
                
                if (!email || !newPassword || !confirmPassword) {
                    alert('Please fill in all fields');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                
                if (newPassword.length < 6) {
                    alert('Password must be at least 6 characters long');
                    return;
                }
                
                alert('Password reset functionality would be implemented here');
                window.location.href = 'login.html';
            });
        }
    }

    // Navigation between pages
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
                if (this.textContent.includes('LOG IN') || this.textContent.includes('BACK TO LOGIN')) {
                    window.location.href = 'login.html';
                } else if (this.textContent.includes('SIGN UP')) {
                    window.location.href = 'signup.html';
                }
            }
        });
    });

    // Forgot password link navigation
    const forgotPasswordLinks = document.querySelectorAll('.forgot-password a');
    forgotPasswordLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'reset.html';
        });
    });
});