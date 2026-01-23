document.querySelectorAll('a.link').forEach(link => {
    link.addEventListener('click', function (event) {
        if (this.getAttribute("href") === "#") {
            event.preventDefault();
        }
        document.querySelectorAll('a.link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const currencyOptions = document.querySelectorAll(".currency-option");
    const LangOptions = document.querySelectorAll(".lang-option");
    const selectedCurrency = document.getElementById("selected-currency");
    const selectedLang = document.getElementById("selected-lang");

    currencyOptions.forEach(option => {
        option.addEventListener("click", function (event) {
            event.preventDefault(); 
            const selectedValue = this.getAttribute("data-value"); 
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
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.querySelector(".cart table tbody");
    const totalPriceElement = document.getElementById("total-price");
    const subtotalElement = document.getElementById("subtotal-price");
    const cartCount = document.querySelector(".cart-count");
    const shippingFee = 20; 

    function updateCart() {
        cartContainer.innerHTML = `
            <tr>
                <th></th>
                <th>Product</th>
                <th>Total Price</th>
                <th>Quantity</th>
                <th>Unit Price</th>
            </tr>
        `;  

        let subtotal = 0;

        if (cartItems.length === 0) {
            cartContainer.innerHTML = `<div class='text-center' style='padding: 20px; font-size: 20px; color: #22262A;'>No Products To Show</div>`;
            subtotalElement.innerText = "$0.00";
            totalPriceElement.innerText = "$0.00";
            document.querySelector(".payment").style.display = "none";
            document.querySelector(".check").style.display = "none";
            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount();
            return;
        } else {
            document.querySelector(".payment").style.display = "flex";
            document.querySelector(".check").style.display = "block";
        }

        cartItems.forEach((item, index) => {
            let quantity = item.quantity > 0 ? item.quantity : 1;
            let price = parseFloat(item.price.replace("$", "")) || 0;
            let subtotalItem = (price * quantity).toFixed(2);
            subtotal += parseFloat(subtotalItem);

            let row = document.createElement("tr");
            row.innerHTML = `
                <td class="x" style="cursor: pointer; color: #FF4252; font-weight: 600;" onclick="removeProduct(${index})">x</td>
                <td>
                    <div class="pro1">
                        <div class="card mb-3">
                            <div class="row g-0">
                                <div class="col-md-4">
                                    <img src="${item.image}" class="img-fluid rounded-start" alt="${item.title}">
                                </div>
                                <div class="col-md-8">
                                    <div class="card-body">
                                        <p class="card-text">${item.title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
                <td>$${(price * quantity).toFixed(2)}</td> 
                <td class="n">
                    <button class="sp1" onclick="updateQuantity(${index}, -1)" style="border:none;background:none;color:#33A0FF">-</button>
                    <span style="color:black" id="quantity-${index}">${quantity}</span>
                    <button class="sp2" onclick="updateQuantity(${index}, 1)" style="border:none;background:none;color:#33A0FF">+</button>
                </td>
                <td>$${price.toFixed(2)}</td>
            `;
            cartContainer.appendChild(row);
        });

        let total = subtotal + shippingFee;
        subtotalElement.innerText = `$${subtotal.toFixed(2)}`;
        totalPriceElement.innerText = `$${total.toFixed(2)}`;

        localStorage.setItem("cart", JSON.stringify(cartItems));
        updateCartCount();
    }

    function updateCartCount() {
        if (cartCount) {
            let totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCount.textContent = totalItems > 0 ? `${totalItems} items` : "0 items";
        }
    }

    window.updateQuantity = function (index, change) {
        if (cartItems[index]) {
            let newQuantity = cartItems[index].quantity + change;
            if (newQuantity > 0) {
                cartItems[index].quantity = newQuantity;
            } else {
                cartItems[index].quantity = 1;
            }
            document.getElementById(`quantity-${index}`).textContent = cartItems[index].quantity;
            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCart();
        }
    }

    window.removeProduct = function (index) {
        cartItems.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cartItems));
        updateCart();
    }

    updateCart();
});

document.addEventListener("DOMContentLoaded", function () {
    function updateCartTotal() {
        let subtotal = 0;
        let shippingFee = 20; 
    
        let rows = document.querySelectorAll(".cart table tr");
    
        rows.forEach((row, index) => {
            if (index === 0) return; 
    
            let priceElement = row.querySelector("td:nth-child(3)");   
            let qtyElement = row.querySelector("td:nth-child(4) span:nth-child(2)");  
            let unitPriceElement = row.querySelector("td:nth-child(5)");   
    
            if (priceElement && qtyElement && unitPriceElement) {
                let price = parseFloat(priceElement.textContent.replace("$", "")) || 0;
                let qty = parseInt(qtyElement.textContent) || 0;
                let unitPrice = price / qty;    
    
                unitPriceElement.textContent = `$${unitPrice.toFixed(2)}`;
                subtotal += price;
            }
        });
    
        document.getElementById("subtotal-price").textContent = `$${subtotal.toFixed(2)}`;
        let total = subtotal + shippingFee;
        document.getElementById("total-price").textContent = `$${total.toFixed(2)}`;
    }
    
    document.querySelectorAll(".sp1, .sp2").forEach(button => {
        button.addEventListener("click", function () {
            let qtyElement = this.parentElement.querySelector("span:nth-child(2)");
            let currentQty = parseInt(qtyElement.textContent) || 0;

            if (this.classList.contains("sp1") && currentQty > 1) {
                qtyElement.textContent = currentQty - 1;
            } else if (this.classList.contains("sp2")) {
                qtyElement.textContent = currentQty + 1;
            }

            updateCartTotal();
        });
    });

    updateCartTotal();  
});

document.addEventListener("DOMContentLoaded", function() {
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
});

document.querySelectorAll('.page').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelector('.activel')?.classList.remove('activel');
        this.classList.add('activel');
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const cartCount = document.querySelector(".cart-count");
    const searchIcon = document.getElementById("searchIcon");
    const searchContainer = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");
    const closeSearch = document.getElementById("closeSearch");
    const searchResults = document.getElementById("searchResults");
    const itemsLink = document.querySelector(".cart-link");

    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    function updateCartCount() {
        localStorage.setItem("cart", JSON.stringify(cartItems));
        cartCount.textContent = cartItems.length ? `${cartItems.length} items` : "0 items";
    }

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

    updateCartCount();
});

