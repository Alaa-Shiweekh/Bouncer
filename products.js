'use strict';
/* ============================================================
   products.js
   ============================================================ */

const PRODUCTS_API = 'https://fakestoreapi.com/products';
const ITEMS_PER_PAGE = 6;

const state = {
  all:      [],
  filtered: [],
  page:     1,
  maxPrice: 1000,
};

/* ---- DOM refs ---- */
const grid       = document.getElementById('productsGrid');
const pagination = document.getElementById('paginationBar');
const countEl    = document.getElementById('itemCount');
const sortSel    = document.getElementById('sortSelect');
const priceRange = document.getElementById('priceRange');
const priceMax   = document.getElementById('priceMax');

/* ---- Fetch ---- */
async function fetchProducts(category) {
  const url = (!category || category === 'all')
    ? PRODUCTS_API
    : `${PRODUCTS_API}/category/${encodeURIComponent(category)}`;

  showSkeletons();
  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    state.all = data;
    applyFilters();
  } catch (err) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>Could not load products</h3>
        <p>Please check your connection and try again.</p>
      </div>`;
    console.error(err);
  }
}

/* ---- Filters + Sort ---- */
function applyFilters() {
  let result = [...state.all];

  // Price filter
  result = result.filter(p => p.price <= state.maxPrice);

  // Sort
  const sort = sortSel.value;
  if (sort === 'price-asc')  result.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (sort === 'name')       result.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'rating')     result.sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0));

  state.filtered = result;
  state.page = 1;
  renderPage();
}

/* ---- Render current page ---- */
function renderPage() {
  const total = state.filtered.length;
  const pages = Math.ceil(total / ITEMS_PER_PAGE);
  const start = (state.page - 1) * ITEMS_PER_PAGE;
  const slice = state.filtered.slice(start, start + ITEMS_PER_PAGE);

  countEl.textContent = `${total} item${total !== 1 ? 's' : ''}`;

  if (slice.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No products found</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>`;
    pagination.innerHTML = '';
    return;
  }

  grid.innerHTML = slice.map(p => buildProductCard(p)).join('');
  initCardActions(grid);

  renderPagination(pages);

  // Scroll to top of products
  grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---- Pagination ---- */
function renderPagination(totalPages) {
  if (totalPages <= 1) { pagination.innerHTML = ''; return; }

  const makeBtn = (label, page, disabled = false, active = false) => {
    const cls = ['page-btn', active ? 'active' : '', disabled ? 'disabled' : ''].filter(Boolean).join(' ');
    return `<button class="${cls}" data-page="${page}" ${disabled ? 'disabled aria-disabled="true"' : ''} ${active ? 'aria-current="page"' : ''}>${label}</button>`;
  };

  let html = makeBtn('&laquo;', state.page - 1, state.page === 1);

  // Show up to 5 page buttons with ellipsis
  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= state.page - 1 && i <= state.page + 1)) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }

  range.forEach(p => {
    if (p === '...') { html += `<span class="page-btn" style="pointer-events:none;opacity:.4">...</span>`; }
    else { html += makeBtn(p, p, false, p === state.page); }
  });

  html += makeBtn('&raquo;', state.page + 1, state.page === totalPages);

  pagination.innerHTML = html;

  pagination.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page);
      if (!isNaN(p) && p > 0 && p <= totalPages) {
        state.page = p;
        renderPage();
      }
    });
  });
}

/* ---- Skeletons ---- */
function showSkeletons() {
  grid.innerHTML = Array.from({ length: ITEMS_PER_PAGE }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton sk-img"></div>
      <div class="skeleton sk-line"></div>
      <div class="skeleton sk-line short"></div>
    </div>`).join('');
  pagination.innerHTML = '';
  countEl.textContent = 'Loading...';
}

/* ---- Header category links ---- */
function setActiveNavLink(category) {
  document.querySelectorAll('.main-nav .main-nav-link[data-cat]').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.cat === category || (category === 'all' && link.dataset.cat === 'all')) {
      link.classList.add('active');
    }
  });
}

/* ---- Update breadcrumb ---- */
function updateBreadcrumb(category) {
  const label = document.getElementById('categoryLabel');
  if (!label) return;
  const map = {
    'all': 'All Products',
    'electronics': 'Electronics',
    'jewelery': 'Jewelery',
    "men's clothing": "Men's Clothing",
    "women's clothing": "Women's Clothing",
  };
  label.textContent = map[category] || 'Products';
}

/* ---- Category nav links ---- */
document.querySelectorAll('.main-nav .main-nav-link[data-cat]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const cat = link.dataset.cat === 'mens' ? "men's clothing"
              : link.dataset.cat === 'womens' ? "women's clothing"
              : link.dataset.cat;
    history.pushState({}, '', `products.html?category=${encodeURIComponent(cat)}`);
    fetchProducts(cat);
    setActiveNavLink(link.dataset.cat);
    updateBreadcrumb(cat);
  });
});

/* ---- Price range ---- */
if (priceRange) {
  priceRange.addEventListener('input', () => {
    state.maxPrice = parseInt(priceRange.value);
    priceMax.textContent = `$${state.maxPrice}`;
    applyFilters();
  });
}

/* ---- Sort ---- */
sortSel?.addEventListener('change', applyFilters);

/* ---- Mobile sidebar ---- */
const sidebarToggleBtn = document.getElementById('sidebarToggle');
const sidebarEl        = document.getElementById('storeSidebar');
const sidebarClose     = document.getElementById('sidebarClose');

sidebarToggleBtn?.addEventListener('click', () => sidebarEl?.classList.add('open'));
sidebarClose?.addEventListener('click', () => sidebarEl?.classList.remove('open'));

// Close sidebar on outside click
document.addEventListener('click', e => {
  if (sidebarEl?.classList.contains('open') &&
      !sidebarEl.contains(e.target) &&
      e.target !== sidebarToggleBtn) {
    sidebarEl.classList.remove('open');
  }
});

/* ---- Color swatches ---- */
document.querySelectorAll('.color-swatch input').forEach(input => {
  input.addEventListener('change', function () {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    this.parentElement.classList.add('selected');
  });
});

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  const params   = new URLSearchParams(window.location.search);
  const category = params.get('category') || 'all';
  const search   = params.get('search') || '';

  updateBreadcrumb(category);

  const catKey = category === "men's clothing" ? 'mens' : category === "women's clothing" ? 'womens' : category;
  setActiveNavLink(catKey);

  fetchProducts(category).then(() => {
    if (search) {
      state.all = state.all.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
      if (document.getElementById('categoryLabel')) {
        document.getElementById('categoryLabel').textContent = `Search: "${search}"`;
      }
      applyFilters();
    }
  });
});
