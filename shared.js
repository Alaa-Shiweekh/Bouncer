'use strict';

const Cart = (() => {
  const KEY = 'bouncer_cart';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function saveAll(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function add(product) {
    const items = getAll();
    const existing = items.find(i => String(i.id) === String(product.id));
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      items.push({ ...product, quantity: 1 });
    }
    saveAll(items);
    return items;
  }

  function remove(id) {
    const items = getAll().filter(i => String(i.id) !== String(id));
    saveAll(items);
    return items;
  }

  function updateQty(id, qty) {
    const items = getAll();
    const item = items.find(i => String(i.id) === String(id));
    if (item) {
      item.quantity = Math.max(1, qty);
      saveAll(items);
    }
    return items;
  }

  function totalCount() {
    return getAll().reduce((s, i) => s + (i.quantity || 1), 0);
  }

  function subtotal() {
    return getAll().reduce((s, i) => {
      const p = parseFloat(String(i.price).replace('$', '')) || 0;
      return s + p * (i.quantity || 1);
    }, 0);
  }

  return { getAll, add, remove, updateQty, totalCount, subtotal };
})();

const Wishlist = (() => {
  const KEY = 'bouncer_wishlist';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function toggle(product) {
    const items = getAll();
    const idx = items.findIndex(i => String(i.id) === String(product.id));
    if (idx > -1) { items.splice(idx, 1); }
    else { items.push(product); }
    localStorage.setItem(KEY, JSON.stringify(items));
    return idx === -1;
  }

  function has(id) {
    return getAll().some(i => String(i.id) === String(id));
  }

  return { toggle, has, getAll };
})();

const Toast = (() => {
  let container = null;

  function ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  function show(msg, type) {
    ensureContainer();
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3100);
  }

  return { show };
})();

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = (rating % 1) >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function refreshCartBadge() {
  const count = Cart.totalCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count > 0 ? count + ' items' : '0 items';
  });
}

function buildProductCard(product, showHot) {
  const inWish = Wishlist.has(product.id);
  const rating = product.rating?.rate ?? 0;
  const ratingCount = product.rating?.count ?? 0;
  const stars  = renderStars(rating);

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card-img-wrap">
        ${showHot ? '<span class="product-card-badge">HOT</span>' : ''}
        <a href="product.html?id=${product.id}" aria-label="${esc(product.title)}">
          <img src="${esc(product.image)}" alt="${esc(product.title)}" loading="lazy">
        </a>
        <div class="product-card-overlay">
          <button class="icon-btn add-to-cart-btn" title="Add to cart" data-id="${product.id}" data-title="${esc(product.title)}" data-price="${product.price}" data-image="${esc(product.image)}">
            <img src="assets/cart_2.svg" alt="Add to cart">
          </button>
          <button class="icon-btn wishlist-btn ${inWish ? 'wishlisted' : ''}" title="Wishlist" data-id="${product.id}" data-title="${esc(product.title)}" data-price="${product.price}" data-image="${esc(product.image)}">
            <img src="assets/${inWish ? 'heart-solid' : 'heart-regular'}.svg" alt="Wishlist">
          </button>
        </div>
      </div>
      <div class="product-card-body">
        <a href="product.html?id=${product.id}" class="product-card-title">${esc(product.title)}</a>
        <div class="product-card-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${ratingCount})</span>
        </div>
        <div class="product-card-price">
          <span class="price-now">$${parseFloat(product.price).toFixed(2)}</span>
        </div>
      </div>
    </div>`;
}

function initCardActions(container) {
  container.addEventListener('click', e => {
    const cartBtn = e.target.closest('.add-to-cart-btn');
    const wishBtn = e.target.closest('.wishlist-btn');

    if (cartBtn) {
      const { id, title, price, image } = cartBtn.dataset;
      Cart.add({ id: Number(id), title, price, image });
      refreshCartBadge();
      Toast.show('Added to cart', 'success');
    }

    if (wishBtn) {
      const { id, title, price, image } = wishBtn.dataset;
      const added = Wishlist.toggle({ id: Number(id), title, price, image });
      wishBtn.classList.toggle('wishlisted', added);
      const img = wishBtn.querySelector('img');
      if (img) img.src = added ? 'assets/heart-solid.svg' : 'assets/heart-regular.svg';
      Toast.show(added ? 'Added to wishlist' : 'Removed from wishlist');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const hamburger    = document.getElementById('navHamburger');
  const mobilePanel  = document.getElementById('navMobilePanel');

  if (hamburger && mobilePanel) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobilePanel.classList.toggle('open');
    });
  }

  const searchBtn   = document.getElementById('searchToggleBtn');
  const searchWrap  = document.getElementById('navSearchWrap');
  const searchClose = document.getElementById('navSearchClose');
  const searchInput = document.getElementById('navSearchInput');

  if (searchBtn && searchWrap) {
    searchBtn.addEventListener('click', e => {
      e.preventDefault();
      searchWrap.classList.add('active');
      searchInput?.focus();
    });

    searchClose?.addEventListener('click', e => {
      e.preventDefault();
      searchWrap.classList.remove('active');
      if (searchInput) searchInput.value = '';
    });

    searchInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = 'products.html?search=' + encodeURIComponent(searchInput.value.trim());
      }
    });
  }

  refreshCartBadge();

  document.querySelectorAll('.cart-nav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  });

  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('#selected-lang').forEach(el => el.textContent = opt.dataset.value);
    });
  });

  document.querySelectorAll('.currency-option').forEach(opt => {
    opt.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('#selected-currency').forEach(el => el.textContent = opt.dataset.value);
    });
  });
});
