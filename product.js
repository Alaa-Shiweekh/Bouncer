document.addEventListener("DOMContentLoaded", async function () {
  const cartCount = document.querySelector(".cart-count");
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
  const bestSellerContainer = document.querySelector(".best .carousel-inner");
  const relatedContainer = document.querySelector(".related .row");
  const mainImage = document.getElementById("mainImage");
  const productTitle = document.querySelector(".card-title");
  const productPrice = document.querySelector(".price span");

  console.log("relatedContainer:", relatedContainer);

  function updateCartCount() {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    if (cartCount) {
      cartCount.textContent = cartItems.length
        ? `${cartItems.length} items`
        : "0 items";
    } else {
      console.warn("Cart count element not found!");
    }
  }

  window.onpopstate = function () {
    cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartCount();
    renderProductDetails();       
  };

  const currencyOptions = document.querySelectorAll(".currency-option");
  const langOptions = document.querySelectorAll(".lang-option");
  const selectedCurrency = document.getElementById("selected-currency");
  const selectedLang = document.getElementById("selected-lang");

  currencyOptions.forEach((option) => {
    option.addEventListener("click", function (event) {
      event.preventDefault();
      selectedCurrency.textContent = this.getAttribute("data-value");
    });
  });

  langOptions.forEach((option) => {
    option.addEventListener("click", function (event) {
      event.preventDefault();
      selectedLang.textContent = this.getAttribute("data-value");
    });
  });

  const searchIcon = document.getElementById("searchIcon");
  const searchContainer = document.getElementById("searchContainer");
  const searchInput = document.getElementById("searchInput");
  const closeSearch = document.getElementById("closeSearch");
  const searchResults = document.getElementById("searchResults");

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
    document.querySelectorAll(".card-text").forEach((item) => {
      if (item.textContent.toLowerCase().includes(query.toLowerCase())) {
        found = true;
        searchResults.innerHTML += `<div>${item.textContent}</div>`;
      }
    });
    searchResults.style.display = found ? "block" : "none";
  }

  const itemsLink = document.querySelector(".cart-link");
  if (itemsLink) {
    itemsLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "cart.html";
    });
  }

  document.addEventListener("click", function (event) {
    const addToCartIcon = event.target.closest(".add-to-cart");
    if (addToCartIcon) {
      const card = addToCartIcon.closest(".card");
      if (card) {
        const product = {
          title: card.querySelector(".card-text").textContent,
          price:
            card.querySelector(".price span")?.textContent.replace("$", "") ||
            card.querySelector(".price2 span")?.textContent.replace("$", ""),
          image: card.querySelector(".card-img-top").src,
        };
        cartItems.push(product);
        updateCartCount();
        console.log("Added to cart (icon):", product);
      } else {
        console.error("Card not found for add-to-cart!");
      }
      return;
    }

    const addToWishlistIcon = event.target.closest(".add-to-wishlist");
    if (addToWishlistIcon) {
      const icon = addToWishlistIcon.querySelector(".icon");
      const card = addToWishlistIcon.closest(".card");
      if (icon && card) {
        icon.classList.toggle("active");
        icon.src = icon.classList.contains("active")
          ? "assets/heart-solid.svg"
          : "assets/hearts.svg";
        const product = {
          title: card.querySelector(".card-text").textContent,
          price:
            card.querySelector(".price span")?.textContent.replace("$", "") ||
            card.querySelector(".price2 span")?.textContent.replace("$", ""),
          image: card.querySelector(".card-img-top").src,
        };
        wishlistItems.push(product);
        localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
        console.log("Added to wishlist (icon):", product);
      } else {
        console.error("Icon or card not found for add-to-wishlist!");
      }
      return;
    }

    const addToCartButton = event.target.closest(".addTocart");
    if (addToCartButton) {
      if (mainImage && productTitle && productPrice) {
        const quantityEl = document.querySelector(".choose-num .num");
        const product = {
          title: productTitle.textContent,
          price: productPrice.textContent.replace("$", ""),
          image: mainImage.src,
          quantity: quantityEl ? parseInt(quantityEl.textContent) : 1,
        };
        cartItems.push(product);
        updateCartCount();
        console.log("Added to cart (button):", product);
      } else {
        console.error(
          "Missing mainImage, productTitle, or productPrice! Check HTML structure."
        );
        console.log("mainImage:", mainImage);
        console.log("productTitle:", productTitle);
        console.log("productPrice:", productPrice);
      }
      return;
    }

    const wishButton = event.target.closest(".wish");
    if (wishButton) {
      const icon = wishButton.querySelector("img");
      if (icon && mainImage && productTitle && productPrice) {
        icon.classList.toggle("active");
        icon.src = icon.classList.contains("active")
          ? "assets/heart-solid.svg"
          : "assets/hearts.svg";
        const product = {
          title: productTitle.textContent,
          price: productPrice.textContent.replace("$", ""),
          image: mainImage.src,
        };
        wishlistItems.push(product);
        localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
        console.log("Added to wishlist (button):", product);
      } else {
        console.error(
          "Missing icon, mainImage, productTitle, or productPrice! Check HTML structure."
        );
        console.log("icon:", icon);
        console.log("mainImage:", mainImage);
        console.log("productTitle:", productTitle);
        console.log("productPrice:", productPrice);
      }
      return;
    }
  });

  const thumbnails = document.querySelectorAll(".choose-img .thumbnail");
  if (thumbnails.length && mainImage) {
    let defaultActive = document.querySelector(".choose-img .thumbnail.active");
    if (defaultActive) {
      mainImage.src = defaultActive.src;
    } else if (thumbnails[0]) {
      mainImage.src = thumbnails[0].src;
      thumbnails[0].classList.add("active");
    }

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        if (mainImage.src === this.src) {
          this.classList.add("fade");
          setTimeout(() => this.classList.remove("fade"), 300);   
        } else {
          mainImage.src = this.src;
          thumbnails.forEach((img) => img.classList.remove("active"));
          this.classList.add("active");
        }

        if (this.src.includes("last.svg")) {
          mainImage.style.marginTop = "-10px";
        } else {
          mainImage.style.marginTop = "10px";
        }
      });
    });

    async function updateThumbnails() {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get("id");
      if (productId && mainImage) {
        const product = await fetchProductById(productId);
        if (product) {
          thumbnails.forEach((thumbnail) => {
            thumbnail.src = product.image;      
          });
          mainImage.src = product.image;  
          if (!defaultActive && thumbnails[0])
            thumbnails[0].classList.add("active");
        }
      }
    }
    updateThumbnails(); 
  }

  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");
  if (tabs.length && contents.length) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");
        contents.forEach((content) => content.classList.remove("active"));
        document.getElementById(this.dataset.target).classList.add("active");
      });
    });
  }

  const minusBtn = document.querySelector(".choose-num .min");
  const plusBtn = document.querySelector(".choose-num .max");
  const numberEl = document.querySelector(".choose-num .num");
  if (minusBtn && plusBtn && numberEl) {
    const minValue = 1;
    const maxValue = 10;

    minusBtn.addEventListener("click", () => {
      let currentValue = parseInt(numberEl.textContent);
      if (currentValue > minValue) numberEl.textContent = currentValue - 1;
    });

    plusBtn.addEventListener("click", () => {
      let currentValue = parseInt(numberEl.textContent);
      if (currentValue < maxValue) numberEl.textContent = currentValue + 1;
    });
  }

  const defaultColor = document.querySelector(".color-box input:checked");
  if (defaultColor) defaultColor.parentElement.classList.add("selected");

  document.querySelectorAll(".color-box input").forEach((input) => {
    input.addEventListener("change", function () {
      document
        .querySelectorAll(".color-box")
        .forEach((label) => label.classList.remove("selected"));
      this.parentElement.classList.add("selected");
    });
  });

  async function fetchProducts() {
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  async function fetchProductById(id) {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  function generateProductHTML(product) {
    return `
        <div class="carousel-item">
            <div class="product-card">
                <div class="card card2">
                    <div class="image-container">
                        <a href="product.html?id=${product.id}">
                            <img src="${product.image}" class="card-img-top imgc1" alt="${product.title}">
                        </a>
                        <div class="overlay">
                            <div class="icons">
                                <div class="icon-circle add-to-cart" data-id="${product.id}">
                                    <img src="assets/cart_2.svg" alt="Add to Cart" class="icon">
                                </div>
                                <div class="icon-circle add-to-wishlist" data-id="${product.id}">
                                    <img src="assets/hearts.svg" alt="Add to Wishlist" class="icon">
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="card-body">
                        <h6 class="card-text">
                            <a href="product.html?id=${product.id}" class="product-link" title="${product.title}">${product.title}</a>
                        </h6>
                        <div class="rating"><img src="assets/rate.svg" alt="Rating"></div>
                        <p class="price2"><span>$${product.price}</span></p>
                    </div>
                </div>
            </div>
        </div>`;
  }

  function generateRelatedProductHTML(product) {
    return `
        <div class="col-2">
            <div class="card">
                <div class="image-container">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.image}" class="card-img-top imgc1" alt="${product.title}">
                    </a>
                    <div class="overlay">
                        <div class="icons">
                            <div class="icon-circle add-to-cart" data-id="${product.id}">
                                <img src="assets/cart_2.svg" alt="Add to Cart" class="icon">
                            </div>
                            <div class="icon-circle add-to-wishlist" data-id="${product.id}">
                                <img src="assets/hearts.svg" alt="Add to Wishlist" class="icon">
                            </div>
                        </div>
                    </div>
                </div>              
                <hr>
                <div class="card-body">
                    <h6 class="card-text">
                        <a href="product.html?id=${product.id}" class="product-link" title="${product.title}">${product.title}</a>
                    </h6>
                    <div class="rating"><img src="assets/rate.svg" alt="Rating"></div>
                    <p class="price"><span>$${product.price}</span></p>
                </div>
            </div>
        </div>`;
  }

  async function renderBestSellerAndRelated() {
    const allProducts = await fetchProducts();
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    let currentCategory = "";

    if (productId) {
      const product = await fetchProductById(productId);
      if (product) currentCategory = product.category;
    }

    if (bestSellerContainer) {
      const filteredProducts = currentCategory
        ? allProducts.filter((p) => p.category === currentCategory).slice(0, 4)
        : allProducts.slice(0, 4);
      bestSellerContainer.innerHTML = filteredProducts
        .map(generateProductHTML)
        .join("");
      if (bestSellerContainer.children.length > 0) {
        bestSellerContainer.children[0].classList.add("active");
      }
    }

    if (relatedContainer) {
      const allFilteredProducts = currentCategory
        ? allProducts.filter((p) => p.category === currentCategory)
        : allProducts;
      const bestSellerProducts = currentCategory
        ? allFilteredProducts.slice(0, 4)
        : allProducts.slice(0, 4);
      let relatedProducts = allFilteredProducts.slice(4, 8); 

      if (relatedProducts.length < 4 && allFilteredProducts.length > 0) {
        const repeatCount = 4 - relatedProducts.length;
        const availableProducts = allFilteredProducts.slice(0);  
        let repeatedProducts = [];
        for (let i = 0; i < repeatCount; i++) {
          const index = i % availableProducts.length; 
          repeatedProducts.push(availableProducts[index]);
        }
        relatedProducts = [...relatedProducts, ...repeatedProducts].slice(0, 4);
      }

      relatedContainer.innerHTML = relatedProducts
        .slice(0, 4)
        .map(generateRelatedProductHTML)
        .join("");
      console.log(
        "Related products (same category) rendered:",
        relatedProducts.length
      );
    } else {
      console.warn("relatedContainer not found in DOM!");
    }
  }

  async function renderProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId || !mainImage || !productTitle || !productPrice) return;

    const product = await fetchProductById(productId);
    if (!product) return;
    const categoryLink = document.getElementById("category-name");
    const productNameLink = document.querySelector(".homeAcc a:last-child");  

    if (categoryLink && productNameLink) {
      categoryLink.textContent = product.category; 
      categoryLink.href = `products.html?category=${encodeURIComponent(
        product.category
      )}`;
      productNameLink.textContent = product.title; 
      productTitle.setAttribute("title", product.title); 
      productNameLink.href = `product.html?id=${productId}`; 
    } else {
      console.error("Breadcrumb elements not found!");
    }

    mainImage.src = product.image;
    productTitle.textContent = product.title;
    productPrice.textContent = `$${product.price}`;

    const priceDel = document.querySelector(".price del");
    if (priceDel) {
      priceDel.textContent = `$${(product.price + 50).toFixed(2)}`;
    }

    const categorySpan = document.querySelector(".s2-2");
    if (categorySpan) {
      categorySpan.textContent = product.category;
    }

    const thumbnails = document.querySelectorAll(".choose-img .thumbnail");
    console.log("Thumbnails found:", thumbnails);
    if (thumbnails.length && mainImage) {
      let defaultActive = document.querySelector(
        ".choose-img .thumbnail.active"
      );
      console.log("Default active thumbnail:", defaultActive);
      if (defaultActive) {
        mainImage.src = defaultActive.src;
        console.log("Set mainImage to default active:", defaultActive.src);
      } else if (thumbnails[0]) {
        mainImage.src = thumbnails[0].src;
        thumbnails[0].classList.add("active");
        console.log(
          "Set mainImage to first thumbnail and added active:",
          thumbnails[0].src
        );
      } else {
        console.warn("No thumbnails found to set as default!");
      }

      thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener("click", function () {
          console.log("Clicked thumbnail:", this.src);
          if (!mainImage || !this) {
            console.error("mainImage or thumbnail is null!");
            return;
          }

          console.log(
            "Before click - Current active thumbnails:",
            Array.from(thumbnails)
              .filter((img) => img.classList.contains("active"))
              .map((img) => img.src)
          );

          thumbnails.forEach((img) => {
            if (img.classList.contains("active")) {
              img.classList.remove("active");
              console.log("Removed active from:", img.src);
            }
          });

          this.classList.add("active");
          console.log("Added active to:", this.src);

          if (mainImage.src === this.src) {
            this.classList.add("fade");
            setTimeout(() => this.classList.remove("fade"), 300);  
            console.log("Same image clicked, added fade:", this.src);
          } else {
            mainImage.src = this.src;
            console.log("Changed mainImage to:", mainImage.src);
          }

          console.log(
            "After click - New active thumbnail:",
            Array.from(thumbnails)
              .filter((img) => img.classList.contains("active"))
              .map((img) => img.src)
          );

          if (this.src.includes("last.svg")) {
            mainImage.style.marginTop = "-10px";
          } else {
            mainImage.style.marginTop = "10px";
          }
        });
      });

      async function updateThumbnails() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id");
        if (productId && mainImage) {
          const product = await fetchProductById(productId);
          if (product) {
            thumbnails.forEach((thumbnail) => {
              thumbnail.src = product.image;  
            });
            mainImage.src = product.image;  
            thumbnails.forEach((img) => img.classList.remove("active"));
            if (thumbnails[0]) {
              thumbnails[0].classList.add("active");
              console.log(
                "Updated active to first thumbnail after API call:",
                thumbnails[0].src
              );
            }
          } else {
            console.warn("Product not found for ID:", productId);
          }
        }
      }
      updateThumbnails(); 
    }
  }

  await renderBestSellerAndRelated();
  await renderProductDetails();

  updateCartCount();
});


