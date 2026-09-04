'use strict';

const SHIPPING_FEE = 20;
const VALID_COUPONS = { 'SAVE10': 10, 'BOUNCER20': 20 };

let discountPercent = 0;

function getEl(id) { return document.getElementById(id); }

function renderCart() {
  const cartBody = getEl('cartBody');
  if (!cartBody) return;

  const items = Cart.getAll();
  refreshCartBadge();

  if (items.length === 0) {
    cartBody.innerHTML =
      '<div class="cart-empty">' +
        '<h3>Your cart is empty</h3>' +
        '<p>Looks like you haven\'t added anything yet.</p>' +
        '<a href="products.html?category=all">Start Shopping</a>' +
      '</div>';
    updateSummary(0);
    return;
  }

  let rows = '';
  items.forEach(function(item) {
    const price = parseFloat(String(item.price).replace('$', '')) || 0;
    const qty   = item.quantity || 1;
    const total = (price * qty).toFixed(2);
    const safeTitle = esc(item.title);
    const safeImage = esc(item.image);
    const itemId    = String(item.id);

    rows +=
      '<tr class="cart-row">' +
        '<td class="td-remove">' +
          '<button class="btn-remove" data-action="remove" data-id="' + itemId + '" aria-label="Remove item">&times;</button>' +
        '</td>' +
        '<td>' +
          '<div class="cart-product">' +
            '<div class="cart-product-img">' +
              '<img src="' + safeImage + '" alt="' + safeTitle + '" loading="lazy">' +
            '</div>' +
            '<div class="cart-product-info">' +
              '<a href="product.html?id=' + itemId + '" class="cart-product-name">' + safeTitle + '</a>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td class="td-price">$' + price.toFixed(2) + '</td>' +
        '<td>' +
          '<div class="qty-control">' +
            '<button class="qty-btn" data-action="dec" data-id="' + itemId + '" type="button">&#8722;</button>' +
            '<span class="qty-value">' + qty + '</span>' +
            '<button class="qty-btn" data-action="inc" data-id="' + itemId + '" type="button">&#43;</button>' +
          '</div>' +
        '</td>' +
        '<td class="td-total">$' + total + '</td>' +
      '</tr>';
  });

  cartBody.innerHTML =
    '<table class="cart-table">' +
      '<thead><tr>' +
        '<th class="td-remove"></th>' +
        '<th>Product</th>' +
        '<th class="td-price">Unit Price</th>' +
        '<th>Quantity</th>' +
        '<th>Total</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';

  updateSummary(Cart.subtotal());
}

function updateSummary(subtotal) {
  const hasItems = subtotal > 0;
  const shipping = hasItems ? SHIPPING_FEE : 0;
  const discount = subtotal * (discountPercent / 100);
  const total    = subtotal + shipping - discount;

  const subtotalEl  = getEl('subtotalEl');
  const shippingEl  = getEl('shippingEl');
  const totalEl     = getEl('totalEl');
  const discountRow = getEl('discountRow');
  const discountEl  = getEl('discountEl');

  if (subtotalEl)  subtotalEl.textContent  = '$' + subtotal.toFixed(2);
  if (shippingEl)  shippingEl.textContent  = hasItems ? '$' + shipping.toFixed(2) : 'Free';
  if (totalEl)     totalEl.textContent     = '$' + total.toFixed(2);

  if (discountRow && discountEl) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = '-$' + discount.toFixed(2);
    } else {
      discountRow.style.display = 'none';
    }
  }
}

document.addEventListener('click', function(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const cartBody = getEl('cartBody');
  if (!cartBody || !cartBody.contains(btn)) return;

  const action = btn.getAttribute('data-action');
  const id     = btn.getAttribute('data-id');

  if (action === 'remove') {
    Cart.remove(id);
    renderCart();
    Toast.show('Item removed from cart');
    return;
  }

  if (action === 'inc') {
    const items = Cart.getAll();
    const item  = items.find(function(i) { return String(i.id) === id; });
    if (item) {
      Cart.updateQty(id, (item.quantity || 1) + 1);
      renderCart();
    }
    return;
  }

  if (action === 'dec') {
    const items = Cart.getAll();
    const item  = items.find(function(i) { return String(i.id) === id; });
    if (item) {
      if ((item.quantity || 1) <= 1) {
        Cart.remove(id);
        Toast.show('Item removed from cart');
      } else {
        Cart.updateQty(id, (item.quantity || 1) - 1);
      }
      renderCart();
    }
    return;
  }
});

var applyBtn = document.getElementById('applyVoucher');
if (applyBtn) {
  applyBtn.addEventListener('click', function() {
    var code = (getEl('couponInput').value || '').trim().toUpperCase();
    if (VALID_COUPONS[code] !== undefined) {
      discountPercent = VALID_COUPONS[code];
      Toast.show('Coupon applied: ' + discountPercent + '% off!', 'success');
      updateSummary(Cart.subtotal());
    } else {
      Toast.show('Invalid coupon code.', 'error');
    }
  });
}

var couponInput = document.getElementById('couponInput');
if (couponInput) {
  couponInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { if (applyBtn) applyBtn.click(); }
  });
}

var clearBtn = document.getElementById('clearCartBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', function() {
    if (!confirm('Remove all items from your cart?')) return;
    localStorage.removeItem('bouncer_cart');
    renderCart();
    Toast.show('Cart cleared');
  });
}

var checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', function() {
    if (Cart.totalCount() === 0) {
      Toast.show('Your cart is empty.', 'error');
      return;
    }
    Toast.show('Redirecting to checkout...', 'success');
  });
}

document.addEventListener('DOMContentLoaded', renderCart);
