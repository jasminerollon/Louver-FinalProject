<?php 
session_start();
// No output before this point
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset Password</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<link rel="stylesheet" href="../../css/user/home-user.css">
</head>
<body>

<div class="navbar">
    <div class="logo">
        <img src="../../assets/pictures/logo.png" alt="Louver Logo" style="height:60px; width:auto;" />
        <span>LOUVER</span>
    </div>

    <div class="navbar-right">
        <nav>
            <a href="#">BROWSE</a>
            <a href="#">MY ORDERS</a>
            <a href="account.html" class="active">PROFILE</a>
        </nav>
        <div class="cart" title="Cart" role="button" aria-label="View cart">
            <img src="../../assets/pictures/cart.png" alt="Cart" class="cart-icon">
            <span class="cart-count" aria-live="polite" style="display: none;">0</span>
        </div>
    </div>
</div>

<div class="container" style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 80px); padding: 40px 20px;">
    <form id="passwordForm" style="width: 100%; max-width: 450px; background: white; border-radius: 25px; padding: 40px 35px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);">
        <h1 style="font-size: 46px; color: #b20808; font-weight: 700; text-align: center; margin: 0 0 8px 0; line-height: 1.2; font-family: 'Inter', sans-serif;">RESET YOUR<br>PASSWORD</h1>
        
        <div class="divider" style="width: 100%; height: 3px; background: #c93131; margin: 25px 0;"></div>
        
        <div class="profile-picture-wrapper" style="display: flex; justify-content: center; margin-bottom: 30px;">
            <div class="profile-icon" id="profile-icon" style="width: 80px; height: 80px; border-radius: 50%; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #B40000;">
                <i class="fas fa-user"></i>
            </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 25px;">
            <label for="new-password" style="display: block; color: #666; font-size: 13px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">NEW PASSWORD</label>
            <input type="password" name="new_password" id="new-password" placeholder="Enter new password" required style="width: 100%; padding: 15px 20px; border: 2px solid #B40000; border-radius: 30px; outline: none; font-size: 15px; box-sizing: border-box;">
        </div>
        
        <div class="form-group" style="margin-bottom: 30px;">
            <label for="confirm-password" style="display: block; color: #666; font-size: 13px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">CONFIRM PASSWORD</label>
            <input type="password" name="confirm_password" id="confirm-password" placeholder="Re-enter new password" required style="width: 100%; padding: 15px 20px; border: 2px solid #B40000; border-radius: 30px; outline: none; font-size: 15px; box-sizing: border-box;">
        </div>
        
        <button type="submit" id="submitBtn" style="width: 100%; background: #B40000; border: none; padding: 15px 24px; color: white; border-radius: 30px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s; margin-top: 10px;">Save Changes</button>
    </form>
</div>

<!-- Success Modal -->
<div id="successModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
    <div style="background: white; border-radius: 20px; padding: 40px 50px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-width: 400px; margin: 20px;">
        <div style="width: 80px; height: 80px; background: #28a745; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check" style="font-size: 40px; color: white;"></i>
        </div>
        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Success!</h2>
        <p style="color: #666; margin: 0 0 25px 0; font-size: 16px;">Your password has been updated successfully.</p>
        <button onclick="redirectToAccount()" style="background: #B40000; color: white; border: none; padding: 12px 40px; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s;">OK</button>
    </div>
</div>

<!-- Error Modal -->
<div id="errorModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
    <div style="background: white; border-radius: 20px; padding: 40px 50px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-width: 400px; margin: 20px;">
        <div style="width: 80px; height: 80px; background: #dc3545; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-times" style="font-size: 40px; color: white;"></i>
        </div>
        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Error</h2>
        <p id="errorMessage" style="color: #666; margin: 0 0 25px 0; font-size: 16px;"></p>
        <button onclick="closeErrorModal()" style="background: #B40000; color: white; border: none; padding: 12px 40px; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s;">OK</button>
    </div>
</div>

<script src="../../js/user/script.js"></script>
<script>
    // Add hover effect to button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('mouseenter', () => {
        submitBtn.style.background = '#8B0000';
    });
    submitBtn.addEventListener('mouseleave', () => {
        submitBtn.style.background = '#B40000';
    });
    
    // Form validation and AJAX submission
    document.getElementById('passwordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword.length < 6) {
            showError('Password must be at least 6 characters long');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            showError('Passwords do not match');
            return false;
        }
        
        // Submit via AJAX
        const formData = new FormData();
        formData.append('new_password', newPassword);
        formData.append('confirm_password', confirmPassword);
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';
            
            const response = await fetch('../../database/user/updateCustomerPassword.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Server error');
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // Clear form
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
                // Show success modal
                document.getElementById('successModal').style.display = 'flex';
            } else {
                showError(data.message || 'An error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Network error. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
        
        return false;
    });
    
    function redirectToAccount() {
        window.location.href = 'account.html';
    }
    
    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').style.display = 'flex';
    }
    
    function closeErrorModal() {
        document.getElementById('errorModal').style.display = 'none';
    }
</script>
</body>
</html>
