document.addEventListener("DOMContentLoaded", function () {
    const currencyOptions = document.querySelectorAll(".currency-option");
    const LangOptions = document.querySelectorAll(".lang-option");
    const selectedCurrency = document.getElementById("selected-currency");
    const selectedLang = document.getElementById("selected-lang");

    currencyOptions.forEach(option => {
        option.addEventListener("click", function (event) {
            event.preventDefault(); 
            const selectedValue = this.getAttribute("data-value")
            selectedCurrency.textContent = selectedValue;  
        });
    });
    LangOptions.forEach(option => {
        option.addEventListener("click", function (event) {
            event.preventDefault();  
            const selectedValue = this.getAttribute("data-value"); 
            selectedLang.textContent = selectedValue;   
        });
    });
    let defaultColor = document.querySelector('.color-box input:checked');
    if (defaultColor) {
        defaultColor.parentElement.classList.add("selected");
    }

    document.querySelectorAll('.color-box input').forEach(input => {
        input.addEventListener('change', function() {
            document.querySelectorAll('.color-box').forEach(label => {
                label.classList.remove("selected");
            });
            this.parentElement.classList.add("selected");
        });
    });
    const productsContainer = document.querySelector(".screen .container .row");
    const paginationContainer = document.querySelector(".pagination");
    const categoryLinks = document.querySelectorAll("header a.link");
    const cartCount = document.querySelector(".cart-count");
    const searchIcon = document.getElementById("searchIcon");
    const searchContainer = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");
    const closeSearch = document.getElementById("closeSearch");
    const searchResults = document.getElementById("searchResults");
    const itemsLink = document.querySelector(".cart-link");
    const productsPerPage = 6;
    let currentProducts = [];
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    function updateCartCount() {
        localStorage.setItem("cart", JSON.stringify(cartItems));
        cartCount.textContent = cartItems.length ? `${cartItems.length} items` : "0 items";
    }

    async function fetchProducts(category = "all") {
        let url = "https://fakestoreapi.com/products";
        if (category !== "all") {
            url = `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
        }

        try {
            const response = await fetch(url);
            currentProducts = await response.json();
            setupPagination(currentProducts);
            renderProducts(1);
        } catch (error) {
            console.error("Failed to load products:", error);
            productsContainer.innerHTML = "<p>Failed to load products.</p>";
        }
    }

    function renderProducts(pageNumber) {
        productsContainer.innerHTML = "";
        const startIndex = (pageNumber - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = currentProducts.slice(startIndex, endIndex);

        if (paginatedProducts.length === 0) {
            productsContainer.innerHTML = "<p>no products available.</p>";
            paginationContainer.style.display = "none"; 
            return;
        }

        paginatedProducts.forEach(product => {
            const productCard = `
                <div class="col-4">
                    <div class="card">
                        <div class="image-container">
                            <a href="product.html?id=${product.id}">
                            </a>
                            <img src="${product.image}" class="card-img-top imgc1" alt="${product.title}">

                            <div class="overlay">
                                <div class="icons">
                                    <div class="icon-circle add-to-cart">
                                        <img src="assets/cart_2.svg" alt="Add to Cart" class="icon">
                                    </div>
                                    <div class="icon-circle add-to-wishlist">
                                        <img src="assets/hearts.svg" alt="Add to Wishlist" class="icon">
                                    </div>
                                </div>
                            </div>
                        </div>              
                        <hr>
                        <div class="card-body">
                            <h6 class="card-text" title="${product.title}">
                            <a href="product.html?id=${product.id}" class="product-link" title="${product.title}">${product.title}</a>
                            </h6>
                            <div class="rating"><img src="assets/rate.svg" alt=""></div>
                            <p class="price"><span>$${product.price}</span></p>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += productCard;
        });

        paginationContainer.style.display = "flex"; 
    }

    function setupPagination(products) {
        paginationContainer.innerHTML = ""; 
        const totalPages = Math.ceil(products.length / productsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.style.display = "none"; 
            paginationContainer.style.background = "none";  
            return;
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageElement = document.createElement("span");
            pageElement.classList.add("page");
            if (i === 1) pageElement.classList.add("activel");
            pageElement.textContent = i;
            pageElement.addEventListener("click", function () {
                document.querySelector(".activel")?.classList.remove("activel");
                this.classList.add("activel");
                renderProducts(i);
            });
            paginationContainer.appendChild(pageElement);
        }

        paginationContainer.style.display = "flex"; 
        paginationContainer.style.background = ""; 
    }

    function setActiveCategory(category) {
        categoryLinks.forEach(link => link.classList.remove("active"));
        const activeLink = document.querySelector(`header a.link[data-category="${category}"]`);
        if (activeLink) {
            activeLink.classList.add("active");
        }
    }

    categoryLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            const category = this.getAttribute("data-category");
            if (category) {
                event.preventDefault();
                history.pushState({}, "", `products.html?category=${category}`);
                fetchProducts(category);
                setActiveCategory(category);
                updateCategoryName(category);
            }
        });
    });

    itemsLink.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "cart.html";
    });

    searchIcon.addEventListener("click", function (event) {
        event.preventDefault();
        searchContainer.style.display = "flex";
        searchIcon.style.display = "none";
        searchInput.focus();
    });

    closeSearch.addEventListener("click", function (event) {
        event.preventDefault();
        searchContainer.style.display = "none";
        searchIcon.style.display = "block";
        searchInput.value = "";
        searchResults.style.display = "none";
    });

    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter" && searchInput.value.trim()) {
            event.preventDefault();
            searchProducts(searchInput.value.trim());
        }
    });

    function searchProducts(query) {
        searchResults.innerHTML = "";
        let found = false;
        document.querySelectorAll(".card-text").forEach(item => {
            if (item.textContent.toLowerCase().includes(query.toLowerCase())) {
                found = true;
                searchResults.innerHTML += `<div>${item.textContent}</div>`;
            }
        });
        searchResults.style.display = found ? "block" : "none";
    }

    document.addEventListener("click", function (event) {
        if (event.target.closest(".add-to-cart")) {
            const card = event.target.closest(".card");
            const product = {
                title: card.querySelector(".card-text").textContent,
                price: card.querySelector(".price span").textContent,
                image: card.querySelector(".card-img-top").src
            };
            cartItems.push(product);
            updateCartCount();
        }
        if (event.target.closest(".add-to-wishlist")) {
            const icon = event.target.closest(".add-to-wishlist").querySelector(".icon");

            icon.classList.toggle("active");

            const card = event.target.closest(".card");
            const product = {
                title: card.querySelector(".card-text").textContent,
                price: card.querySelector(".price span").textContent,
                image: card.querySelector(".card-img-top").src
            };
            wishlistItems.push(product);
            localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
        }
        
    });
    function updateItemCount(count) {
        const itemCount = document.getElementById("itemCount");
        itemCount.textContent = `${count} items`;
    }
    async function fetchProducts(category = "all") {
        let url = "https://fakestoreapi.com/products";
        if (category !== "all") {
            url = `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
        }
    
        try {
            const response = await fetch(url);
            currentProducts = await response.json();
            updateItemCount(currentProducts.length);  
            setupPagination(currentProducts);
            renderProducts(1);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    }
    document.getElementById("sortSelect").addEventListener("change", function () {
        const sortBy = this.value;
    
        if (sortBy === "name") {
            currentProducts.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "price") {
            currentProducts.sort((a, b) => a.price - b.price);
        }
    
        renderProducts(1);
    });
        
    
    function updateCategoryName(category) {
        const categoryNameElement = document.getElementById("category-name");
        if (categoryNameElement) {
            let categoryName = "Products"; 
    
            if (category === "electronics") {
                categoryName = "Electronics";
            } else if (category === "jewelery") {
                categoryName = "Jewelery";
            } else if (category === "men's clothing") {
                categoryName = "Men's Clothing";
            } else if (category === "women's clothing") {
                categoryName = "Women's Clothing";
            }
    
            categoryNameElement.textContent = categoryName;   
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get("category") || "all";     
    updateCategoryName(category);
    fetchProducts(category);
    setActiveCategory(category);
    updateCartCount(); 

});
