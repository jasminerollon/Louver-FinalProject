document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = form.email.value.trim();
        const new_password = form.new_password.value;
        const confirm_password = form.confirm_password.value;

        if (new_password !== confirm_password) {
            message.textContent = "Passwords do not match";
            return;
        }

        // Send POST request to PHP
        fetch("../../database/business-owner/businessResetPassword.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `email=${encodeURIComponent(email)}&new_password=${encodeURIComponent(new_password)}`
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                message.style.color = "green";
                message.textContent = "Password reset successfully! Redirecting to login...";
                setTimeout(() => {
                    window.location.href = "../../html/business-owner/business-owner-login.html";
                }, 2000);
            } else {
                message.style.color = "red";
                message.textContent = data.message;
            }
        })
        .catch(err => {
            console.error(err);
            message.style.color = "red";
            message.textContent = "Something went wrong";
        });
    });
});
