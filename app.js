// Simple Vue.js app
var webstore = new Vue({
  el: '#app',
  
  // Data - stores all information
  data: {
    sitename: 'Online Classes',
    isSignedIn: true, 
    showProduct: true,
    products: [], // Loaded from backend API
    cart: [],
    searchQuery: '',
    sortBy: 'subject',
    sortOrder: 'ascending',
    
    // Sign in credentials
    signInUsername: '',
    signInPassword: '',
    
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

  // 🔥 Fetch classes from LIVE backend
  mounted() {
    fetch("https://backend-online-classes.onrender.com/api/classes")
      .then(res => res.json())
      .then(data => {
        this.products = data;
      })
      .catch(err => console.error("Error fetching classes:", err));
  },

  // Methods - functions
  methods: {
    addToCart(product) {
      this.cart.push(product.id);
    },
    
    cartCount(id) {
      return this.cart.filter(item => item === id).length;
    },
    
    canAddToCart(product) {
      return product.availableInventory > this.cartCount(product.id);
    },
    
    showCheckout() {
      if (!this.showProduct || this.cart.length > 0) {
        this.showProduct = !this.showProduct;
      } else {
        alert('Your cart is empty!');
      }
    },
    
    backToClasses() {
      this.showProduct = true;
    },
    
    handleSignIn() {
      if (this.signInUsername === 'sd' && this.signInPassword === '123') {
        this.isSignedIn = true;
        alert('Welcome!');
      } else {
        alert('Invalid username or password!');
      }
    },
    
    removeFromCart(productId) {
      const index = this.cart.indexOf(productId);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
    },
    
    removeAllFromCart(productId) {
      this.cart = this.cart.filter(id => id !== productId);
    },
    
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
    
    getProduct(id) {
      return this.products.find(p => p.id === id);
    },
    
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
    cartItemCount() {
      return this.cart.length || 0;
    },
    
    filteredProducts() {
      let filtered = this.products;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(product => {
          return (
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.location.toLowerCase().includes(query)
          );
        });
      }

      const isAsc = this.sortOrder === 'ascending';

      if (this.sortBy === 'subject') {
        filtered = filtered.sort((a, b) =>
          isAsc ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
        );
      } else if (this.sortBy === 'location') {
        filtered = filtered.sort((a, b) =>
          isAsc ? a.location.localeCompare(b.location) : b.location.localeCompare(a.location)
        );
      } else if (this.sortBy === 'availability') {
        filtered = filtered.sort((a, b) =>
          isAsc ? a.availableInventory - b.availableInventory : b.availableInventory - a.availableInventory
        );
      } else if (this.sortBy === 'price') {
        filtered = filtered.sort((a, b) =>
          isAsc ? a.price - b.price : b.price - a.price
        );
      }

      return filtered;
    },

    cartItems() {
      const itemMap = {};
      
      this.cart.forEach(id => {
        if (itemMap[id]) {
          itemMap[id]++;
        } else {
          itemMap[id] = 1;
        }
      });
      
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
