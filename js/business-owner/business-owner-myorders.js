document.addEventListener("DOMContentLoaded", () => {
    // Modal elements
    const orderModal = document.getElementById("orderModal");
    const cancelOrderModal = document.getElementById("cancelOrderModal");
    const reportModal = document.getElementById("reportModal");
    let currentOrderId = null;

    // VIEW ORDER MODAL with dynamic data
    document.querySelectorAll(".view-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            currentOrderId = btn.dataset.orderId;
            await loadOrderDetails(currentOrderId);
            orderModal.style.display = "flex";
        });
    });

    // Load order details via AJAX
    async function loadOrderDetails(orderId) {
        try {
            const formData = new FormData();
            formData.append('action', 'get_order_details');
            formData.append('order_id', orderId);

            const response = await fetch('../../database/business-owner/update-order.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                const order = data.order;
                const items = data.items || [];
                
                // Update modal with order data
                document.getElementById('modalOrderId').textContent = order.order_id;
                
                const statusSpan = document.getElementById('modalStatus');
                statusSpan.textContent = order.order_status;
                statusSpan.className = 'status ' + order.order_status.toLowerCase();
                
                document.getElementById('modalOrderDate').textContent = 
                    `Ordered on: ${new Date(order.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true 
                    })}`;
                
                document.getElementById('modalCustomerName').textContent = order.customer_name;
                document.getElementById('modalContactNumber').textContent = order.contact_number || 'N/A';
                document.getElementById('modalEmail').textContent = order.email || 'N/A';
                
                // Update avatar with initials
                const avatar = document.getElementById('modalAvatar');
                const initials = order.customer_name.split(' ').map(n => n[0]).join('').toUpperCase();
                avatar.textContent = initials;
                avatar.style.backgroundColor = getRandomColor();
                
                // Update items
                const itemsSection = document.getElementById('itemsSection');
                let itemsHTML = '<h3>Items</h3>';
                let subtotal = 0;
                
                if (items.length > 0) {
                    items.forEach(item => {
                        const itemTotal = (item.price_at_time || 0) * (item.quantity || 1);
                        subtotal += itemTotal;
                        itemsHTML += `
                            <div class="item">
                                <span>${item.quantity || 1}x ${item.product_name || 'Item'}</span>
                                <span>₱ ${itemTotal.toFixed(2)}</span>
                            </div>
                        `;
                    });
                } else {
                    // Default items if none in database
                    itemsHTML += `
                        <div class="item">
                            <span>3x 1-pc. Chickenjoy w/ Jolly Spaghetti Solo</span>
                            <span>₱ 492</span>
                        </div>
                        <div class="item">
                            <span>1x Palabok Solo</span>
                            <span>₱ 141</span>
                        </div>
                    `;
                    subtotal = 633;
                }
                
                itemsSection.innerHTML = itemsHTML;
                
                // Update payment summary
                const deliveryFee = 20;
                const total = parseFloat(order.total_price) || subtotal + deliveryFee;
                document.getElementById('modalSubtotal').textContent = `₱ ${subtotal.toFixed(2)}`;
                document.getElementById('modalDelivery').textContent = `₱ ${deliveryFee.toFixed(2)}`;
                document.getElementById('modalTotal').textContent = `₱ ${total.toFixed(2)}`;
                
                // Update cancel modal text
                document.getElementById('cancelOrderText').innerHTML = 
                    `cancel Order ${order.order_id}?`;
                
            } else {
                // Use sample data if API fails
                console.log("Using sample data:", data.message);
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            // Continue with default data if API fails
        }
    }

    // CLOSE ORDER MODAL
    document.getElementById("closeModalBtn").addEventListener("click", () => {
        orderModal.style.display = "none";
    });
    
    orderModal.addEventListener("click", e => {
        if (e.target === orderModal) orderModal.style.display = "none";
    });

    // CANCEL ORDER MODAL
    document.getElementById("cancelBtn").addEventListener("click", () => {
        cancelOrderModal.classList.add("active");
    });

    // Close Cancel Order Modal
    document.getElementById("closeCancelModal").addEventListener("click", () => {
        cancelOrderModal.classList.remove("active");
        document.getElementById("cancelReason").value = "";
    });
    
    cancelOrderModal.addEventListener("click", e => {
        if (e.target === cancelOrderModal) {
            cancelOrderModal.classList.remove("active");
            document.getElementById("cancelReason").value = "";
        }
    });

    // Confirm cancellation
    document.getElementById("confirmCancelBtn").addEventListener("click", async () => {
        const reason = document.getElementById("cancelReason").value.trim();
        
        if (!reason) {
            Swal.fire("Error", "Please provide a reason for cancellation", "error");
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('action', 'cancel_order');
            formData.append('order_id', currentOrderId);
            formData.append('reason', reason);
            
            const response = await fetch('../../database/business-owner/update-order.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                Swal.fire("Success", data.message, "success").then(() => {
                    cancelOrderModal.classList.remove("active");
                    orderModal.style.display = "none";
                    location.reload(); // Reload page to update status
                });
            } else {
                Swal.fire("Error", data.message, "error");
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            Swal.fire("Error", "Failed to cancel order", "error");
        }
    });

    // REPORT ORDER MODAL
    document.getElementById("reportBtn").addEventListener("click", () => {
        reportModal.style.display = "flex";
    });
    
    document.getElementById("closeReportModal").addEventListener("click", () => {
        reportModal.style.display = "none";
        resetReportForm();
    });
    
    document.getElementById("cancelReportBtn").addEventListener("click", () => {
        reportModal.style.display = "none";
        resetReportForm();
    });
    
    reportModal.addEventListener("click", e => {
        if (e.target === reportModal) {
            reportModal.style.display = "none";
            resetReportForm();
        }
    });

    // Confirm report
    document.getElementById("confirmReportBtn").addEventListener("click", () => {
        const category = document.getElementById("reportCategory").value;
        const description = document.getElementById("reportDescription").value.trim();
        
        if (!description) {
            Swal.fire("Error", "Please provide additional information", "error");
            return;
        }
        
        // For demo, just show success
        Swal.fire("Success", "Order reported successfully", "success").then(() => {
            reportModal.style.display = "none";
            resetReportForm();
        });
    });

    function resetReportForm() {
        document.getElementById("reportCategory").value = "Incomplete Payment";
        document.getElementById("reportDescription").value = "";
        document.getElementById("fileInput").value = "";
        document.getElementById("uploadBox").querySelector("p").textContent = 
            "Upload screenshots, photos, or videos";
    }

    // UPLOAD FILE
    const uploadBox = document.getElementById("uploadBox");
    const fileInput = document.getElementById("fileInput");
    
    uploadBox.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            uploadBox.querySelector("p").textContent = fileInput.files[0].name;
        }
    });

    // TABS
    const tabs = document.querySelectorAll(".tab");
    const rows = document.querySelectorAll("tbody tr");
    
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const selectedTab = tab.dataset.tab;
            rows.forEach(row => {
                if (selectedTab === "orders") {
                    row.style.display = "";
                } else {
                    // For refunds tab, you can filter based on your logic
                    const status = row.querySelector('.status').textContent;
                    row.style.display = (status === 'Refunded') ? "" : "none";
                }
            });
        });
    });

    // SEARCH FUNCTIONALITY
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        rows.forEach(row => {
            const orderId = row.querySelector('td:first-child').textContent;
            const customerName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            
            if (orderId.includes(searchTerm) || customerName.includes(searchTerm)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    // CONTACT USER BUTTON
    document.getElementById("contactUserBtn").addEventListener("click", () => {
        const phone = document.getElementById("modalContactNumber").textContent;
        const email = document.getElementById("modalEmail").textContent;
        
        Swal.fire({
            title: "Contact Information",
            html: `<p><strong>Phone:</strong> ${phone}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <div style="margin-top: 20px;">
                       <button onclick="window.location.href='tel:${phone}'" 
                               style="margin-right: 10px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px;">
                           Call Customer
                       </button>
                       <button onclick="window.location.href='mailto:${email}'" 
                               style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px;">
                           Send Email
                       </button>
                   </div>`,
            showCloseButton: true,
            showConfirmButton: false
        });
    });

    // Helper function for random colors
    function getRandomColor() {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
            '#9b59b6', '#1abc9c', '#d35400', '#34495e'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});