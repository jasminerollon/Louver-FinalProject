document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const summaryContainer = document.getElementById('summaryItemsContainer');
  const totalPriceEl = document.getElementById('totalPrice');
  const addressInput = document.getElementById('deliveryAddress');
  const noteInput = document.getElementById('orderNote');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const DELIVERY_FEE = 20;
  const cartBadge = document.querySelector('.cart-count');

  async function fetchCart() {
    try {
      const res = await fetch('../../database/user/getCart.php');
      const data = await res.json();
      renderCart(data || []);
      updateBadge();
    } catch (err) {
      console.error(err);
      renderCart([]);
    }
  }

  async function updateBadge() {
    try {
      const res = await fetch('../../database/user/getCartCount.php');
      const data = await res.json();
      if (cartBadge) cartBadge.textContent = data?.count ?? 0;
    } catch (_) {
      // ignore
    }
  }

  function renderCart(items) {
    cartItemsContainer.innerHTML = '';
    summaryContainer.innerHTML = '';

    if (!items.length) {
      cartItemsContainer.innerHTML = '<p class="no-orders-msg">Your cart is empty.</p>';
      totalPriceEl.textContent = '₱ 0';
      return;
    }

    let subtotal = 0;

    items.forEach(item => {
      const lineTotal = Number(item.price) * Number(item.quantity);
      subtotal += lineTotal;

      const card = document.createElement('div');
      card.className = 'cart-card';
      card.innerHTML = `
        <img src="../../assets/pictures/businessphotos/${item.image || 'default-food.png'}" alt="${item.NAME}" class="item-img" onerror="this.src='../../assets/pictures/default-food.png'">
        <div class="info">
          <h3>${item.NAME}</h3>
          <p class="subtext">${item.business_name || ''}</p>
          <div class="quantity-box">
            <button class="qty-btn" data-product-id="${item.product_id}" data-delta="-1">-</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn" data-product-id="${item.product_id}" data-delta="1">+</button>
          </div>
        </div>
        <span class="price">₱ ${lineTotal.toFixed(2)}</span>
      `;
      cartItemsContainer.appendChild(card);

      const row = document.createElement('div');
      row.className = 'summary-row';
      row.innerHTML = `<span>${item.quantity}x ${item.NAME}</span><span>₱ ${lineTotal.toFixed(2)}</span>`;
      summaryContainer.appendChild(row);
    });

    const grandTotal = subtotal + (items.length ? DELIVERY_FEE : 0);
    totalPriceEl.textContent = `₱ ${grandTotal.toFixed(2)}`;
  }

  async function saveMetaAndNotify() {
    const address = addressInput?.value.trim() || '';
    const note = noteInput?.value.trim() || '';
    try {
      const formData = new FormData();
      formData.append('delivery_address', address);
      formData.append('note', note);
      const res = await fetch('../../database/user/saveCartMeta.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data?.success) {
        alert('Delivery info saved. Proceeding to checkout.');
      } else {
        alert(data?.message || 'Failed to save delivery info');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save delivery info');
    }
  }

  async function setQuantity(productId, delta) {
    const currentQtyEl = [...document.querySelectorAll('.qty-btn')]
      .find(btn => btn.dataset.productId === String(productId))
      ?.parentElement?.querySelector('.qty-number');
    const current = currentQtyEl ? parseInt(currentQtyEl.textContent, 10) : 1;
    const next = current + delta;
    const newQty = next < 0 ? 0 : next;

    try {
      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('quantity', newQty);
      const res = await fetch('../../database/user/updateCart.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data?.success) {
        fetchCart();
      } else {
        alert(data?.message || 'Failed to update cart');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update cart');
    }
  }

  cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const productId = btn.dataset.productId;
    const delta = parseInt(btn.dataset.delta, 10);
    setQuantity(productId, delta);
  });

  checkoutBtn?.addEventListener('click', saveMetaAndNotify);

  fetchCart();
});

