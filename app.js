// Simple Vue.js app
var webstore = new Vue({
  el: '#app',
  
  data: {
    sitename: 'Online Classes',
    isSignedIn: true,
    showProduct: true,

    // LOADED FROM BACKEND
    products: [],

    cart: [],
    searchQuery: '',
    sortBy: 'subject',
    sortOrder: 'ascending',

    signInUsername: '',
    signInPassword: '',

    order: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      zip: '',
      county: '',
      phone: ''
    },

    lastOrder: null,

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

  methods: {
    // 🔥 FETCH FROM YOUR RENDER BACKEND
    async fetchClasses() {
      try {
        const res = await fetch(
          "https://backend-online-classes.onrender.com/api/classes"
        );

        if (!res.ok) throw new Error("Failed to load classes");
        const data = await res.json();

        this.products = data.map((lesson, index) => ({
          id: index + 1,
          backendId: lesson._id,
          title: lesson.title || "Class",
          description: lesson.description || "",
          price: lesson.price || 0,
          image: lesson.image || "images/default.jpg",
          availableInventory: lesson.availableInventory ?? 0,
          rating: lesson.rating || 4,
          category: lesson.category || "General",
          location: lesson.location || "Online"
        }));

      } catch (err) {
        console.error("Error loading classes:", err);
        alert("Could not load classes from the server.");
      }
    },

    addToCart(product) {
      this.cart.push(product.backendId);
    },

    cartCount(backendId) {
      return this.cart.filter(item => item === backendId).length;
    },

    canAddToCart(product) {
      return product.availableInventory > this.cartCount(product.backendId);
    },

    async showCheckout() {
      if (!this.showProduct || this.cart.length > 0) {
        await this.fetchClasses(); 
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

    removeFromCart(backendId) {
      const index = this.cart.indexOf(backendId);
      if (index > -1) this.cart.splice(index, 1);
    },

    removeAllFromCart(backendId) {
      this.cart = this.cart.filter(id => id !== backendId);
    },

    getProduct(backendId) {
      return this.products.find(p => p.backendId === backendId);
    },

    getCartTotal() {
      let total = 0;
      this.cart.forEach(backendId => {
        const product = this.getProduct(backendId);
        if (product) total += product.price;
      });
      return total.toFixed(2);
    },

    buildCounts() {
      const counts = {};
      this.cart.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
      return counts;
    },

    // 🔥 SUBMIT ORDER TO YOUR RENDER BACKEND
    async submitForm() {
      if (this.cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      if (!(this.order.firstName && this.order.lastName)) {
        alert("Please enter your name!");
        return;
      }

      const phone = (this.order.phone || "").trim();
      if (!phone || phone.length < 7) {
        alert("Enter a valid phone number.");
        return;
      }

      await this.fetchClasses();
      const counts = this.buildCounts();

      // Inventory check
      const insufficient = [];
      for (const id in counts) {
        const requested = counts[id];
        const product = this.getProduct(id);
        if (!product || product.availableInventory < requested) {
          insufficient.push(product ? product.title : id);
        }
      }

      if (insufficient.length > 0) {
        alert("Some classes no longer have enough spots.");
        await this.fetchClasses();
        return;
      }

      const body = {
        name: `${this.order.firstName} ${this.order.lastName}`,
        phone: phone,
        lessonIDs: Object.keys(counts),
        spaces: Object.values(counts)
      };

      try {
        const res = await fetch(
          "https://backend-online-classes.onrender.com/api/orders",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          }
        );

        const text = await res.text();
        const data = JSON.parse(text || "{}");

        if (!res.ok) {
          alert("Order failed: " + (data.error || text));
          return;
        }

        alert("Order placed successfully!");
        this.cart = [];
        this.showProduct = true;
        await this.fetchClasses();

      } catch (err) {
        console.error("Order error:", err);
        alert("Could not submit order.");
      }
    },

    clearCart() {
      this.cart = [];
    }
  },

  computed: {
    cartItemCount() {
      return this.cart.length || 0;
    },

    filteredProducts() {
      let filtered = this.products;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
        );
      }

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

    cartItems() {
      const map = {};
      this.cart.forEach(id => {
        map[id] = (map[id] || 0) + 1;
      });

      return Object.keys(map).map(id => {
        const product = this.getProduct(id);
        return {
          product,
          quantity: map[id],
          subtotal: (product.price * map[id]).toFixed(2)
        };
      });
    }
  },

  mounted() {
    this.fetchClasses();
  }
});
