// Vue.js application instance
var webstore = new Vue({
  el: '#app', // Mounting point for Vue app
  
  // Data properties - stores application state
  data: {
    sitename: 'PC Parts Store', // Store name displayed in header
    showProduct: true, // Toggle between product list and checkout page
    products: products, // Product array from products.js
    cart: [], // Shopping cart - stores product IDs
    
    // Customer order information object
    order: {
      firstName: '',
      lastName: '',
      phno: '',
    },
    
    
  },

  // Methods - functions that handle user interactions
  methods: {
    // Add product to shopping cart
    addToCart(product) {
      this.cart.push(product.id); // Push product ID to cart array
    },
    
    // Count how many times a product appears in cart
    cartCount(id) {
      return this.cart.filter(item => item === id).length;
    },
    
    // Check if product can be added to cart (inventory available)
    canAddToCart(product) {
      return product.availableInventory > this.cartCount(product.id);
    },
    
    // Toggle between product list and checkout page
    showCheckout() {
      // Only allow checkout if cart has items
      if (!this.showProduct || this.cart.length > 0) {
        this.showProduct = !this.showProduct;
      } else {
        alert('Your cart is empty! Please add items before checkout.');
      }
    },
    
    // Remove one instance of a product from cart
    removeFromCart(productId) {
      const index = this.cart.indexOf(productId);
      if (index > -1) {
        this.cart.splice(index, 1); // Remove one item
      }
    },
    
    // Remove all instances of a product from cart
    removeAllFromCart(productId) {
      this.cart = this.cart.filter(id => id !== productId);
    },
    
    // Submit order form
    submitForm() {
      // Check if cart is empty
      if (this.cart.length === 0) {
        alert('Your cart is empty! Please add items to cart.');
        return;
      }
      
      // Validate required fields
      if (this.order.firstName && this.order.lastName) {
        alert(`Order placed by ${this.order.firstName} ${this.order.lastName}!`);
        this.cart = []; // Clear cart after successful order
        this.showProduct = true; // Return to product page
      } else {
        alert('Please fill in First Name and Last Name!');
      }
    },
    
    // Get product object by ID
    getProduct(id) {
      return this.products.find(p => p.id === id);
    },
    
    // Calculate total price of all items in cart
    getCartTotal() {
      let total = 0;
      this.cart.forEach(productId => {
        const product = this.getProduct(productId);
        if (product) {
          total += product.price;
        }
      });
      return total.toFixed(2);
    }
  },

  // Computed properties - reactive values calculated from data
  computed: {
    // Get total number of items in cart for display
    cartItemCount() {
      return this.cart.length || ''; // Return empty string if 0
    },
    
    // Sort products by price (lowest to highest)
    sortedProducts() {
      return this.products.sort((a, b) => a.price - b.price);
    },
    
    // Get unique cart items with quantities for checkout display
    cartItems() {
      // Create empty object to store product counts
      const itemMap = {};
      
      // Count quantity of each product in cart
      this.cart.forEach(id => {
        if (itemMap[id]) {
          itemMap[id]++; // Increment if already exists
        } else {
          itemMap[id] = 1; // Initialize to 1 if first time
        }
      });
      
      // Convert to array of objects with product details
      const items = [];
      for (let id in itemMap) {
        const product = this.getProduct(parseInt(id));
        if (product) {
          items.push({
            product: product,
            quantity: itemMap[id],
            subtotal: (product.price * itemMap[id]).toFixed(2)
          });
        }
      }
      return items;
    }
  }
});