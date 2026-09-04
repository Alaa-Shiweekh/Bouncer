'use strict';
/* ============================================================
   product.js — Single Product Detail
   ============================================================ */

const PRODUCTS_API = 'https://fakestoreapi.com/products';

let currentProduct  = null;
let selectedQty     = 1;

/* ---- Fetch product ---- */
async function loadProduct(id) {
  try {
    const [product, allProducts] = await Promise.all([
      fetch(`${PRODUCTS_API}/${id}`).then(r => r.json()),
      fetch(PRODUCTS_API).then(r => r.json()),
    ]);

    currentProduct = product;
    renderProduct(product);
    renderTabs(product);
    renderRelated(product, allProducts);

  } catch (err) {
    console.error('Failed to load product:', err);
    document.getElementById('productPage').innerHTML = `
      <div style="text-align:center;padding:80px 20px;color:var(--text-mid);">
        <h3 style="color:var(--text-dark);">Product not found</h3>
        <p>This product could not be loaded. It may no longer be available.</p>
        <a href="products.html?category=all" style="color:var(--accent);font-weight:700;">Back to Store</a>
      </div>`;
  }
}

/* ---- Render product detail ---- */
function renderProduct(p) {
  const rating  = p.rating?.rate ?? 0;
  const count   = p.rating?.count ?? 0;
  const stars   = renderStars(rating);
  const inWish  = Wishlist.has(p.id);

  // Breadcrumb
  const bcCategory = document.getElementById('bcCategory');
  const bcProduct  = document.getElementById('bcProduct');

  if (bcCategory) {
    bcCategory.textContent  = capitalize(p.category);
    bcCategory.href = `products.html?category=${encodeURIComponent(p.category)}`;
  }
  if (bcProduct) {
    bcProduct.textContent = p.title.length > 40 ? p.title.slice(0, 40) + '...' : p.title;
  }

  document.title = `${p.title} — Bouncer`;

  // Thumbnail images (reuse main + a few alternates we have in assets)
  const thumbs = [
    { src: p.image, alt: p.title },
    { src: 'assets/_0053_rgb_MP582-RGB-bttm_V2.jpg', alt: 'View 2' },
    { src: 'assets/_0066_rgb_MNEN2-RGB-side_V2.jpg', alt: 'View 3' },
    { src: 'assets/air5.png', alt: 'View 4' },
  ];

  const thumbHTML = thumbs.map((t, i) => `
    <div class="prod-thumb ${i === 0 ? 'active' : ''}" data-src="${esc(t.src)}" data-idx="${i}">
      <img src="${esc(t.src)}" alt="${esc(t.alt)}" loading="lazy">
    </div>`).join('');

  const html = `
    <div class="prod-detail">

      <!-- Image Column -->
      <div class="prod-img-col">
        <div class="prod-main-img" id="mainImgWrap">
          <img id="mainImg" src="${esc(p.image)}" alt="${esc(p.title)}">
        </div>
        <div class="prod-thumbnails" id="thumbsRow">
          ${thumbHTML}
        </div>
      </div>

      <!-- Info Column -->
      <div class="prod-info-col">
        <span class="prod-category-tag">${esc(capitalize(p.category))}</span>
        <h1 class="prod-title">${esc(p.title)}</h1>

        <div class="prod-rating-row">
          <span class="stars">${stars}</span>
          <span class="rating-num">${rating.toFixed(1)}</span>
          <span class="rating-count">(${count} reviews)</span>
          <a class="review-link" onclick="document.querySelector('[data-target=tab-reviews]').click();document.getElementById('productTabsSection').scrollIntoView({behavior:'smooth'})">Submit a review</a>
        </div>

        <div class="prod-price-row">
          <span class="prod-price">$${parseFloat(p.price).toFixed(2)}</span>
        </div>

        <div class="prod-meta">
          <div class="prod-meta-row">
            <span class="prod-meta-label">Availability:</span>
            <span class="prod-meta-value in-stock">In Stock</span>
          </div>
          <div class="prod-meta-row">
            <span class="prod-meta-label">Category:</span>
            <a href="products.html?category=${encodeURIComponent(p.category)}" class="prod-meta-value category-link">${esc(capitalize(p.category))}</a>
          </div>
          <div class="prod-meta-row">
            <span class="prod-meta-label">Shipping:</span>
            <span class="prod-meta-value">Free on orders over $50</span>
          </div>
        </div>

        <!-- Color -->
        <div class="prod-color-section">
          <span class="prod-color-label">Select Color:</span>
          <div class="color-palette">
            <label class="color-swatch blue" title="Blue"><input type="radio" name="color" value="blue" checked></label>
            <label class="color-swatch red" title="Red"><input type="radio" name="color" value="red"></label>
            <label class="color-swatch black" title="Black"><input type="radio" name="color" value="black"></label>
            <label class="color-swatch yellow" title="Yellow"><input type="radio" name="color" value="yellow"></label>
          </div>
        </div>

        <!-- Size -->
        <div class="prod-size-section">
          <span class="prod-size-label">Size:</span>
          <select id="sizeSelect">
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M" selected>M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        <!-- Buy row -->
        <div class="prod-buy-row">
          <div class="qty-control">
            <button class="qty-btn" id="qtyDec" aria-label="Decrease quantity">&#8722;</button>
            <span class="qty-value" id="qtyDisplay">1</span>
            <button class="qty-btn" id="qtyInc" aria-label="Increase quantity">&#43;</button>
          </div>
          <button class="btn-add-to-cart" id="addToCartBtn">
            <img src="assets/cart_2.svg" alt="">
            Add to Cart
          </button>
          <button class="btn-wishlist ${inWish ? 'wishlisted' : ''}" id="wishlistBtn" aria-label="Add to wishlist">
            <img src="assets/${inWish ? 'heart-solid' : 'heart-regular'}.svg" alt="Wishlist">
          </button>
        </div>

        <!-- Share -->
        <div class="prod-share-row">
          <span class="share-label">Share:</span>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener" class="share-btn">
            <img src="assets/facebook2.svg" alt=""> Facebook
          </a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(p.title)}" target="_blank" rel="noopener" class="share-btn">
            <img src="assets/twitter2.svg" alt=""> Twitter
          </a>
        </div>
      </div>

    </div>`;

  const page = document.getElementById('productPage');
  page.innerHTML = html;

  // Thumbnail switching
  document.querySelectorAll('.prod-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.prod-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      document.getElementById('mainImg').src = thumb.dataset.src;
    });
  });

  // Qty controls
  document.getElementById('qtyDec').addEventListener('click', () => {
    if (selectedQty > 1) { selectedQty--; document.getElementById('qtyDisplay').textContent = selectedQty; }
  });

  document.getElementById('qtyInc').addEventListener('click', () => {
    selectedQty++;
    document.getElementById('qtyDisplay').textContent = selectedQty;
  });

  // Add to cart
  document.getElementById('addToCartBtn').addEventListener('click', () => {
    for (let i = 0; i < selectedQty; i++) {
      Cart.add({ id: p.id, title: p.title, price: p.price, image: p.image });
    }
    refreshCartBadge();
    Toast.show(`Added ${selectedQty} item${selectedQty > 1 ? 's' : ''} to cart`, 'success');
  });

  // Wishlist
  const wishBtn = document.getElementById('wishlistBtn');
  wishBtn.addEventListener('click', () => {
    const added = Wishlist.toggle({ id: p.id, title: p.title, price: p.price, image: p.image });
    wishBtn.classList.toggle('wishlisted', added);
    wishBtn.querySelector('img').src = added ? 'assets/heart-solid.svg' : 'assets/heart-regular.svg';
    Toast.show(added ? 'Added to wishlist' : 'Removed from wishlist');
  });

  // Show tabs + related
  document.getElementById('productTabsSection').style.display = 'block';
}

/* ---- Tabs ---- */
function renderTabs(p) {
  document.getElementById('productDescription').textContent = p.description || 'No description available.';
  document.getElementById('reviewCountLabel').textContent = p.rating?.count ?? 0;

  // Generate fake reviews
  const reviewsList = document.getElementById('reviewsList');
  const names = ['Alex M.', 'Sarah K.', 'Jordan T.', 'Riley P.', 'Casey N.'];
  const comments = [
    'Excellent product, exactly as described. Very happy with the purchase!',
    'Great quality for the price. Arrived quickly and well packaged.',
    'Good product overall. Minor issues but nothing major. Would recommend.',
    'Superb item. The quality exceeded my expectations. Will buy again.',
    'Solid purchase. Matches the description perfectly and shipping was fast.',
  ];

  const count = Math.min(p.rating?.count ?? 0, 5);
  const rating = p.rating?.rate ?? 4;

  if (count === 0) {
    reviewsList.innerHTML = '<p style="color:var(--text-light);font-style:italic;">No reviews yet. Be the first!</p>';
    return;
  }

  reviewsList.innerHTML = Array.from({ length: Math.min(count, 5) }).map((_, i) => {
    const r = Math.max(3, Math.min(5, Math.round(rating + (Math.random() - 0.5))));
    return `
      <div class="review-item">
        <div class="review-header">
          <div class="review-avatar">${names[i][0]}</div>
          <div>
            <div class="review-name">${names[i]}</div>
            <div class="review-date">January ${5 + i * 3}, 2025</div>
          </div>
          <div class="review-stars" style="margin-left:auto;">${'★'.repeat(r)}${'☆'.repeat(5 - r)}</div>
        </div>
        <p class="review-text">${comments[i]}</p>
      </div>`;
  }).join('');

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      document.getElementById(this.dataset.target)?.classList.add('active');
    });
  });
}

/* ---- Related Products ---- */
function renderRelated(product, allProducts) {
  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  if (!related.length) return;

  const section = document.getElementById('relatedSection');
  const grid    = document.getElementById('relatedGrid');

  section.style.display = 'block';
  grid.innerHTML = related.map(p => buildProductCard(p)).join('');
  initCardActions(grid);
}

/* ---- Capitalize helper ---- */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    window.location.href = 'products.html?category=all';
    return;
  }
  loadProduct(id);
});
