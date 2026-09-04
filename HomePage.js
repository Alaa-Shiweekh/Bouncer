'use strict';

/* ============================================================
   HomePage.js
   ============================================================ */

const PRODUCTS_API = 'https://fakestoreapi.com/products';

const state = {
  allProducts: [],
  filteredProducts: [],
  displayedCount: 0,
  perPage: 8,
  currentCategory: 'all',
};

/* ---- Fetch with basic cache ---- */
const cache = {};
async function fetchJSON(url) {
  if (cache[url]) return cache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache[url] = data;
  return data;
}

async function fetchProducts(category = 'all') {
  const url = category === 'all'
    ? PRODUCTS_API
    : `${PRODUCTS_API}/category/${encodeURIComponent(category)}`;
  return fetchJSON(url);
}

/* ---- Render Best Seller grid ---- */
const grid = document.getElementById('bestSellerGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');

function renderBestSeller() {
  const slice = state.filteredProducts.slice(0, state.displayedCount);

  grid.innerHTML = slice.map((p, i) => buildProductCard(p, i < 2)).join('');
  initCardActions(grid);

  const hasMore = state.displayedCount < state.filteredProducts.length;
  loadMoreBtn.style.display = hasMore ? 'inline-block' : 'none';
}

function showSkeletons() {
  grid.innerHTML = Array.from({ length: state.perPage }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton sk-img"></div>
      <div class="skeleton sk-line"></div>
      <div class="skeleton sk-line short"></div>
    </div>`).join('');
  loadMoreBtn.style.display = 'none';
}

async function loadCategory(category) {
  state.currentCategory = category;
  showSkeletons();

  try {
    const products = await fetchProducts(category);
    state.filteredProducts = products;
    state.displayedCount = Math.min(state.perPage, products.length);
    renderBestSeller();
  } catch (err) {
    console.error('Failed to load products:', err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-mid);padding:40px 0;">Failed to load products. Please try again.</p>';
  }
}

/* ---- Category filter tabs ---- */
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.filter-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    this.classList.add('active');
    this.setAttribute('aria-selected', 'true');
    loadCategory(this.dataset.category);
  });
});

/* ---- Load more ---- */
loadMoreBtn.addEventListener('click', () => {
  state.displayedCount = Math.min(
    state.displayedCount + state.perPage,
    state.filteredProducts.length
  );
  renderBestSeller();
});

/* ---- Featured Products ---- */
const featuredGrid = document.getElementById('featuredGrid');

async function renderFeatured() {
  try {
    const products = await fetchJSON(PRODUCTS_API);
    const picks = products.slice(0, 3);

    featuredGrid.innerHTML = picks.map(p => {
      const stars = renderStars(p.rating?.rate ?? 0);
      return `
        <div class="featured-card">
          <div class="featured-card-img">
            <a href="product.html?id=${p.id}">
              <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
            </a>
            <div class="featured-card-overlay">
              <button class="icon-btn add-to-cart-btn" data-id="${p.id}" data-title="${esc(p.title)}" data-price="${p.price}" data-image="${esc(p.image)}" title="Add to cart">
                <img src="assets/cart_2.svg" alt="Cart">
              </button>
              <button class="icon-btn wishlist-btn ${Wishlist.has(p.id) ? 'wishlisted' : ''}" data-id="${p.id}" data-title="${esc(p.title)}" data-price="${p.price}" data-image="${esc(p.image)}" title="Wishlist">
                <img src="assets/${Wishlist.has(p.id) ? 'heart-solid' : 'heart-regular'}.svg" alt="Wishlist">
              </button>
            </div>
          </div>
          <div class="featured-card-body">
            <a href="product.html?id=${p.id}" class="featured-card-title">${esc(p.title)}</a>
            <div class="featured-card-rating">
              <span class="stars">${stars}</span>
              <span class="rating-count">(${p.rating?.count ?? 0})</span>
            </div>
            <div class="featured-card-price">
              <span class="price-now">$${parseFloat(p.price).toFixed(2)}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    initCardActions(featuredGrid);
  } catch (err) {
    console.error('Featured load error:', err);
  }
}

/* ---- Newsletter Popup ---- */
const popup   = document.getElementById('popup');
const overlay = document.getElementById('overlay');

function openPopup() {
  popup.style.display = 'block';
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
  popup.setAttribute('open', '');
}

function closePopup() {
  popup.style.display = 'none';
  overlay.style.display = 'none';
  document.body.style.overflow = '';
  popup.removeAttribute('open');
}

document.getElementById('popupClose').addEventListener('click', closePopup);
overlay.addEventListener('click', closePopup);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePopup();
});

document.getElementById('popupSubscribe').addEventListener('click', () => {
  const email = document.getElementById('popupEmail').value.trim();
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    Toast.show('Please enter a valid email address.', 'error');
    return;
  }
  if (document.getElementById('dontShow').checked) {
    localStorage.setItem('bouncer_hidePopup', '1');
  }
  closePopup();
  Toast.show('Subscribed successfully!', 'success');
});

/* ---- Global Search ---- */
document.getElementById('globalSearchBtn').addEventListener('click', () => {
  const q = document.getElementById('globalSearch').value.trim();
  if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
});

document.getElementById('globalSearch').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
  }
});

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  // Show popup if not hidden
  if (!localStorage.getItem('bouncer_hidePopup')) {
    setTimeout(openPopup, 1000);
  }

  loadCategory('all');
  renderFeatured();
});
