// Simple Vue.js app
var webstore = new Vue({
  el: '#app',
  
  // Data - stores all information
  data: {
    sitename: 'Online Classes',
    isSignedIn: true, // Start as signed in (no sign in page on reload)
    showProduct: true, // true = show classes, false = show checkout

    // products: products, // OLD: local array from products.js
    products: [], // NEW: will be loaded from backend

    cart: [], // Stores backend class IDs (_id) when booked
    searchQuery: '', // What user types in search box
    sortBy: 'subject', // subject, location, price, availability
    sortOrder: 'ascending', // ascending or descending
    
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

  // Methods - functions
  methods: {
    // Add class to cart (store backendId)
    addToCart(product) {
      this.cart.push(product.backendId);
    },
    
    // Count how many of same class in cart
    cartCount(backendId) {
      return this.cart.filter(item => item === backendId).length;
    },
    
    // Check if class can be booked (spots available)
    canAddToCart(product) {
      return product.availableInventory > this.cartCount(product.backendId);
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
    
    // Handle sign in
    handleSignIn() {
      if (this.signInUsername === 'sd' && this.signInPassword === '123') {
        this.isSignedIn = true;
        alert('Welcome!');
      } else {
        alert('Invalid username or password!');
      }
    },
    
    // Remove one class from cart (by backendId)
    removeFromCart(productBackendId) {
      const index = this.cart.indexOf(productBackendId);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
    },
    
    // Remove all of same class from cart (by backendId)
    removeAllFromCart(productBackendId) {
      this.cart = this.cart.filter(id => id !== productBackendId);
    },
    
    // Submit order -> POST to backend
    submitForm() {
      if (this.cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      if (!(this.order.firstName && this.order.lastName)) {
        alert('Please enter your name!');
        return;
      }

      const fullName = `${this.order.firstName} ${this.order.lastName}`.trim();
      // For now, use postcode as phone; you can add a dedicated phone input later
      const phone = this.order.zip || "0000000000";

      // Cart already holds backend IDs
      const lessonIDs = this.cart.slice(); // clone
      // 1 space per entry
      const spaces = this.cart.map(() => 1);

      const body = {
        name: fullName,
        phone: phone,
        lessonIDs: lessonIDs,
        spaces: spaces
      };

      fetch("https://backend-online-classes.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
        .then(response =>
          response.json().then(data => ({ ok: response.ok, data }))
        )
        .then(({ ok, data }) => {
          console.log("Order response:", data);
          if (!ok) {
            alert(`Order failed: ${data.error || 'Unknown error'}`);
            return;
          }
          alert(`Order placed by ${fullName}!`);
          this.cart = [];
          this.showProduct = true;
        })
        .catch(error => {
          console.error("Order error:", error);
          alert("Could not submit order. Please try again.");
        });
    },
    
    // Find class by backend ID
    getProduct(backendId) {
      return this.products.find(p => p.backendId === backendId);
    },
    
    // Calculate total price
    getCartTotal() {
      let total = 0;
      this.cart.forEach(productBackendId => {
        const product = this.getProduct(productBackendId);
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
          return (
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.location.toLowerCase().includes(query)
          );
        });
      }

      // Sort logic with ascending/descending
      const isAsc = this.sortOrder === 'ascending';

      if (this.sortBy === 'subject') {
        filtered = filtered.slice().sort((a, b) =>
          isAsc ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
        );
      } else if (this.sortBy === 'location') {
        filtered = filtered.slice().sort((a, b) =>
          isAsc ? a.location.localeCompare(b.location) : b.location.localeCompare(a.location)
        );
      } else if (this.sortBy === 'availability') {
        filtered = filtered.slice().sort((a, b) =>
          isAsc ? a.availableInventory - b.availableInventory : b.availableInventory - a.availableInventory
        );
      } else if (this.sortBy === 'price') {
        filtered = filtered.slice().sort((a, b) =>
          isAsc ? a.price - b.price : b.price - a.price
        );
      }

      return filtered;
    },

    // Group cart items by class (backendId)
    cartItems() {
      const itemMap = {};
      
      // Count each class by backendId
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
        const product = this.getProduct(id); // id is backendId string
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
  },

  // Load products from backend when app mounts
  mounted() {
    fetch("https://backend-online-classes.onrender.com/api/classes")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to load classes");
        }
        return response.json();
      })
      .then(data => {
        // Map backend lessons into the structure used by the frontend
        this.products = data.map((lesson, index) => ({
          id: index + 1,             // local numeric id for v-for key only
          backendId: lesson._id,     // real MongoDB id for orders
          title: lesson.subject || lesson.title || "Class",
          description: lesson.description || "",
          price: lesson.price || 0,
          image: lesson.image || "images/maths.jpg",
          availableInventory: lesson.spaces ?? 0,
          rating: lesson.rating || 4,
          category: lesson.category || lesson.subject || "General",
          location: lesson.location || "Online"
        }));
      })
      .catch(error => {
        console.error("Error loading classes:", error);
        alert("Could not load classes from the server.");
      });
  }
});
