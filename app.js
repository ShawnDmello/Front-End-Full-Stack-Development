// Simple Vue.js app
var webstore = new Vue({
  el: '#app',
  
  // Data - stores all information
  data: {
    sitename: 'Online Classes',
    isSignedIn: true, // Start as signed in (no sign in page on reload)
    showProduct: true, // true = show classes, false = show checkout

    products: [], // will be loaded from backend

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
      county: '',
      phone: ''      // added phone field (better than using postcode)
    },
    
    // Last created order (used for optional confirmation)
    lastOrder: null,

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
    // Fetch classes from backend and update products
    async fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) throw new Error("Failed to load classes");
        const data = await res.json();
        this.products = data.map((lesson, index) => ({
          id: index + 1,                 // local numeric id for v-for key only
          backendId: lesson._id,         // real MongoDB id for orders
          title: lesson.title || lesson.subject || "Class",
          description: lesson.description || "",
          price: lesson.price || 0,
          image: lesson.image || "images/maths.jpg",
          availableInventory: lesson.availableInventory ?? 0,
          rating: lesson.rating || 4,
          category: lesson.category || lesson.subject || "General",
          location: lesson.location || "Online"
        }));
        console.log("Loaded products from backend:", this.products);
      } catch (err) {
        console.error("Error loading classes:", err);
        alert("Could not load classes from the server.");
      }
    },

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
    async showCheckout() {
      if (!this.showProduct || this.cart.length > 0) {
        // If switching to checkout, refresh inventory first to avoid stale data
        if (this.showProduct) {
          await this.fetchClasses();
        }
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
    },

    // Build counts map: backendId -> quantity
    buildCounts() {
      const counts = {};
      this.cart.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
      return counts;
    },

    // Submit order -> POST to backend with improved error handling and refresh
    async submitForm() {
      if (this.cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      if (!(this.order.firstName && this.order.lastName)) {
        alert('Please enter your name!');
        return;
      }

      // Simple phone validation (require at least 7 digits/characters)
      const phone = (this.order.phone || this.order.zip || "").trim();
      if (!phone || phone.length < 7) {
        alert('Please enter a valid phone or postcode (at least 7 characters).');
        return;
      }

      const fullName = `${this.order.firstName} ${this.order.lastName}`.trim();

      // Ensure up-to-date inventory before sending
      await this.fetchClasses();

      // Build condensed lessonIDs + spaces from cart
      const counts = this.buildCounts();

      // Validate requested quantities against latest inventory
      const insufficient = [];
      for (const id in counts) {
        const requested = counts[id];
        const product = this.getProduct(id);
        const available = product ? (product.availableInventory ?? 0) : 0;
        if (!product) {
          insufficient.push({ id, title: id, requested, available, reason: 'class not found' });
        } else if (available < requested) {
          insufficient.push({ id, title: product.title, requested, available, reason: 'not enough spots' });
        }
      }

      if (insufficient.length > 0) {
        const msg = insufficient.map(i => {
          return `"${i.title}" — requested ${i.requested}, available ${i.available}`;
        }).join("\n");
        alert("Cannot place order because some classes no longer have enough spots:\n" + msg);
        // Refresh classes to show correct inventory
        await this.fetchClasses();
        return;
      }

      // Build arrays expected by backend
      const lessonIDs = [];
      const spaces = [];
      for (const id in counts) {
        lessonIDs.push(id);
        spaces.push(counts[id]);
      }

      const body = {
        name: fullName,
        phone: phone,
        lessonIDs: lessonIDs,
        spaces: spaces
      };

      console.log("Sending order body:", body);

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        // Always read text to surface any non-JSON messages, then try parse
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }

        if (!res.ok) {
          const serverMsg = data ? (data.error || data.message) : text || res.statusText;
          alert(`Order failed: ${serverMsg}`);
          // refresh classes so UI matches server state
          await this.fetchClasses();
          return;
        }

        // success
        const result = data || {};
        alert(`Order placed by ${fullName}! Order ID: ${result._id || 'unknown'}`);
        this.lastOrder = result;
        this.cart = [];
        this.showProduct = true;

        // refresh classes so inventory displayed is up-to-date
        await this.fetchClasses();
      } catch (error) {
        console.error("Order error:", error);
        alert("Could not submit order. Please try again.");
        await this.fetchClasses();
      }
    },

    // Utility to remove entire cart and reset
    clearCart() {
      this.cart = [];
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
    // use the fetchClasses helper
    this.fetchClasses();
  }
});
