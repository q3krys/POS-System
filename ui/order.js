document.addEventListener("DOMContentLoaded", function () { // When content is loaded, all the other functions below work
    const productsList = document.getElementById("products-list");
    const cartList = document.getElementById("cart-items");
    const totalPrice = document.getElementById("total-price");
    const checkoutBtn = document.getElementById("checkout-btn");
    const clearBtn  = document.getElementById("clear-btn");

    // Establishing constants ^ 

    checkoutBtn.disabled = true;
    clearBtn.disabled = true;
    
    let cartItems = {}; // Create empty cart object

    fetch("http://127.0.0.1:5000/getProducts") // getProduct function from server.py
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
        })
        .catch(error => console.error("Error fetching products:", error)); // Outputs error, just in case

    function displayProducts(products) { // Function to print out all products in the database
        const productsByType = {}; // Constant for separating products by their productType field
        products.forEach(product => {
            if (!productsByType[product.product_type]) {
                productsByType[product.product_type] = []; // Empty list to be filled
            }
            productsByType[product.product_type].push(product);
        });

        for (const productType in productsByType) { // Creating column for the products
            const productColumn = document.createElement("div");
            productColumn.className = "product-column";
            // Headings for product columns
            let headingText;
            switch (productType) {
                case "1":
                    headingText = "Drinks";
                    break;
                case "2":
                    headingText = "Small Meals";
                    break;
                case "3":
                    headingText = "Large Meals";
                    break;
                case "4":
                    headingText = "Sides / Desserts";
                    break;
                default:
                    headingText = "Other";
            }
            const heading = document.createElement("h3");
            heading.innerText = headingText;
            heading.classList.add("heading-text");
            productColumn.appendChild(heading);
            // This creates a container for the products, and fills it with product-cards which are the buttons used for ordering
            const productContainer = document.createElement("div"); 
            productContainer.className = "product-container";
            productsByType[productType].forEach(product => {
                const productCard = document.createElement("div");
                productCard.className = "product-card";

                const productName = document.createElement("span");
                productName.innerText = product.name;

                const productPrice = document.createElement("span");
                productPrice.innerText = `£${product.price.toFixed(2)}`;

                productCard.appendChild(productName);
                productCard.appendChild(document.createElement("br"));
                productCard.appendChild(productPrice);

                productCard.addEventListener("click", () => addToCart(product));

                productContainer.appendChild(productCard);
            });
            productColumn.appendChild(productContainer);
            productsList.appendChild(productColumn);
        }
    }

    function addToCart(product) { // This function adds products to the cart
        const productId = product.product_id;

        if (cartItems[productId]) {
            cartItems[productId].quantity++;
            updateCartItem(cartItems[productId]);
        } else {
            const cartItem = {
                product: product,
                quantity: 1,
                total: product.price,
                element: createCartItemElement(product),
            };

            cartItems[productId] = cartItem;
            cartList.appendChild(cartItem.element);
        }

        updateTotalPrice();

        updateButtonState();
    }

    function createCartItemElement(product) {
        const cartItem = document.createElement("li");
        cartItem.className = "cart-item";

        const quantitySpan = document.createElement("span");
        quantitySpan.innerText = "1";

        const nameSpan = document.createElement("span");
        nameSpan.innerText = product.name;

        const priceSpan = document.createElement("span");
        priceSpan.innerText = `£${product.price.toFixed(2)}`;

        const decrementButton = document.createElement("button");
        decrementButton.innerText = "-";
        decrementButton.addEventListener("click", () => decrementQuantity(product));

        const incrementButton = document.createElement("button");
        incrementButton.innerText = "+";
        incrementButton.addEventListener("click", () => incrementQuantity(product));

        cartItem.appendChild(decrementButton);
        cartItem.appendChild(quantitySpan);
        cartItem.appendChild(incrementButton);
        cartItem.appendChild(nameSpan);
        cartItem.appendChild(priceSpan);

        return cartItem;
    }

    function updateCartItem(cartItem) {
        const quantitySpan = cartItem.element.querySelector("span:nth-child(2)");
        const newQuantity = cartItem.quantity;
        quantitySpan.innerText = newQuantity;

        cartItem.total = cartItem.product.price * newQuantity;
    }

    function decrementQuantity(product) { // Function to decrement the quantity of an item
        const productId = product.product_id;
        const cartItem = cartItems[productId];

        if (cartItem.quantity > 1) {
            cartItem.quantity--;
            updateCartItem(cartItem);
        } else {
            cartItem.element.remove();
            delete cartItems[productId];
        }

        updateTotalPrice();

        updateButtonState();
    }

    function incrementQuantity(product) { // Function to increment quantity of an item
        const productId = product.product_id;
        const cartItem = cartItems[productId];

        cartItem.quantity++;
        updateCartItem(cartItem);

        updateTotalPrice();

        updateButtonState();
    }

    function updateTotalPrice() {
        let totalOrderPrice = 0;

        for (const productId in cartItems) {
            const cartItem = cartItems[productId];
            totalOrderPrice += cartItem.total;
        }

        totalPrice.innerText = totalOrderPrice.toFixed(2);
    }

    checkoutBtn.addEventListener("click", () => checkout()); // Event Listener to listen for if the checkout button is clicked

    function checkout() { // Checkout Function to push an order onto the database
        const orderDetails = [];

        for (const productId in cartItems) { // Loop to do each product
            const cartItem = cartItems[productId];
            const total = cartItem.total;
            orderDetails.push({
                product_id: cartItem.product.product_id,
                quantity: cartItem.quantity,
                total: total,
            });
        }

        const orderPayload = {
            order_details: orderDetails,
        };

        // Sends POST request to server.py
        fetch("http://127.0.0.1:5000/createOrder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Order placed successfully:", data);
            clear(false);
            // false tag to prevent confirmation dialogue from showing up when checking out
        })
        .catch(error => console.error("Error placing order:", error));
    }

   clearBtn.addEventListener("click", () => clear());

   function clear(showConfirmation = true) {
        // Enables confirmation dialogue popup only for this function, so that it doesn't show when checking out
        if (showConfirmation) {
            const confirmation = confirm("Are you sure you want to clear the order?");
            // If user cancels, return without clearing the cart
            if (!confirmation) {
                return;
            }
        }
        
        // Emptying the cart
        cartList.innerHTML = "";
        cartItems = {};
        totalPrice.innerText = "0.00"; // Resets total price
        updateButtonState();
    }

    function updateButtonState() {
        // Enable or disable buttons based on cartItems length
        if (Object.keys(cartItems).length > 0) {
            checkoutBtn.disabled = false;
            clearBtn.disabled = false;
        } else {
            checkoutBtn.disabled = true;
            clearBtn.disabled = true;
        }
    }
});