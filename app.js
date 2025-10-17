// Simple Vue.js app
var webstore = new Vue({
  el: '#app',
  
  // Data - stores all information
  data: {
    sitename: 'Online Classes',
    showProduct: true, // true = show classes, false = show checkout
    showSignIn: false, // true = show sign in modal
    products: products, // Array from products.js
    cart: [], // Stores class IDs when booked
    searchQuery: '', // What user types in search box
    sortBy: 'subject', // How to sort: subject, location, or availability
    
    // Sign in credentials
    signInEmail: '',
    signInPassword: '',
    signInName: '',
    
    // Customer information
    order: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      zip: '',
      county: ''
    },
    
    // UK counties list
    counties: {
      'Greater London': 'Greater London',
      'Greater Manchester': 'Greater Manchester',
      'West Midlands': 'West Midlands',
      'West Yorkshire': 'West Yorkshire',
      'Merseyside': 'Merseyside',
      'South Yorkshire': 'South Yorkshire',
      'Tyne and Wear': 'Tyne and Wear',
      'Essex': 'Essex',
      'Kent': 'Kent',
      'Hampshire': 'Hampshire',
      'Surrey': 'Surrey',
      'Hertfordshire': 'Hertfordshire'
    }
  },

  // Methods - functions
  methods: {
    // Add class to cart
    addToCart(product) {
      this.cart.push(product.id);
    },
    
    // Count how many of same class in cart
    cartCount(id) {
      return this.cart.filter(item => item === id).length;
    },
    
    // Check if class can be booked (spots available)
    canAddToCart(product) {
      return product.availableInventory > this.cartCount(product.id);
    },
    
    // Switch between classes page and checkout page
    showCheckout() {
      if (!this.showProduct || this.cart.length > 0) {
        this.showProduct = !this.showProduct;
      } else {
        alert('Your cart is empty!');
      }
    },
    
    // Go back to classes page
    backToClasses() {
      this.showProduct = true;
    },
    
    // Show sign in modal
    openSignIn() {
      this.showSignIn = true;
    },
    
    // Close sign in modal
    closeSignIn() {
      this.showSignIn = false;
      this.signInEmail = '';
      this.signInPassword = '';
      this.signInName = '';
    },
    
    // Handle sign in
    handleSignIn() {
      if (this.signInName && this.signInEmail && this.signInPassword) {
        alert(`Account created for ${this.signInName}!`);
        this.closeSignIn();
      } else {
        alert('Please fill in all fields!');
      }
    },
    
    // Remove one class from cart
    removeFromCart(productId) {
      const index = this.cart.indexOf(productId);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
    },
    
    // Remove all of same class from cart
    removeAllFromCart(productId) {
      this.cart = this.cart.filter(id => id !== productId);
    },
    
    // Submit order
    submitForm() {
      if (this.cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      if (this.order.firstName && this.order.lastName) {
        alert(`Order placed by ${this.order.firstName} ${this.order.lastName}!`);
        this.cart = [];
        this.showProduct = true;
      } else {
        alert('Please enter your name!');
      }
    },
    
    // Find class by ID
    getProduct(id) {
      return this.products.find(p => p.id === id);
    },
    
    // Calculate total price
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

  // Computed - values calculated automatically
  computed: {
    // Count items in cart
    cartItemCount() {
      return this.cart.length || 0;
    },
    
    // Filter and sort classes
    filteredProducts() {
      let filtered = this.products;
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(product => {
          return product.title.toLowerCase().includes(query) ||
                 product.category.toLowerCase().includes(query) ||
                 product.location.toLowerCase().includes(query);
        });
      }
      
      // Sort
      if (this.sortBy === 'subject') {
        filtered = filtered.sort((a, b) => a.category.localeCompare(b.category));
      } else if (this.sortBy === 'location') {
        filtered = filtered.sort((a, b) => a.location.localeCompare(b.location));
      } else if (this.sortBy === 'availability') {
        filtered = filtered.sort((a, b) => b.availableInventory - a.availableInventory);
      }
      
      return filtered;
    },
    
    // Group cart items by class
    cartItems() {
      const itemMap = {};
      
      // Count each class
      this.cart.forEach(id => {
        if (itemMap[id]) {
          itemMap[id]++;
        } else {
          itemMap[id] = 1;
        }
      });
      
      // Create array with details
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
