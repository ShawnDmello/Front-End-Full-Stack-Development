# Online Classes Booking System
link :https://shawndmello.github.io/Front-End-Full-Stack-Development/
A simple web application for booking online classes built with Vue.js.

## Description

This is a front-end web application that allows users to browse, search, and book online classes. Users can filter classes by subject, location, price, and availability, add classes to their cart, and complete checkout with their details.

## Features

- **Sign In Page** - Simple authentication to access the application
- **Browse Classes** - View all available classes with details (subject, location, price, availability)
- **Search Functionality** - Search classes by name, subject, or location
- **Sort Options** - Sort classes by:
  - Subject
  - Location
  - Price
  - Availability
- **Sort Order** - Ascending or Descending
- **Shopping Cart** - Add multiple classes to cart with quantity management
- **Real-time Updates** - Availability updates as items are added to cart
- **Checkout Page** - Complete booking with customer details
- **Order Summary** - View order information before placing order

## Technologies Used

- **Vue.js 2.6.14** - JavaScript framework for reactive UI
- **HTML5** - Structure and markup
- **CSS3** - Styling (simple, clean design)
- **Font Awesome 5.15.1** - Icons
- **JavaScript (ES6)** - Programming logic

## File Structure

```
project/
├── index.html          # Main HTML file
├── app.js              # Vue.js application logic
├── products.js         # Classes data array
├── style.css           # Styling
└── images/             # Image folder
    ├── maths.jpg
    ├── eng.jpg
    ├── music.png
    ├── history.jpg
    ├── lit.jfif
    ├── limp.jpg
    ├── british.jpg
    └── gcse.png
```

## Installation & Setup

1. **Download/Clone** all project files
2. **Create images folder** in the same directory as index.html
3. **Add images** to the images folder (see File Structure)
4. **Open index.html** in a web browser

No server or build process required - just open index.html!

## Usage

### Sign In
- **Username:** `sd`
- **Password:** `123`
- Enter credentials to access the application

### Browse & Search
- Use the search box to find specific classes
- Select sort options using radio buttons
- Choose ascending or descending order

### Add to Cart
- Click "Book Class" button to add a class
- See real-time availability updates
- "In Cart" counter shows how many added

### Checkout
- Click "Cart" button in header
- View cart items with quantities
- Use +/- buttons to adjust quantities
- Click "Remove" to delete items
- Fill in customer details
- Click "Place Order" to complete booking

### Navigation
- Use "Back to Classes" button on checkout page to return to browsing

## Vue.js Features Used

- **v-model** - Two-way data binding for forms and inputs
- **v-for** - Loops to display classes and cart items
- **v-if / v-else** - Conditional rendering for pages and elements
- **v-bind / :** - Dynamic attributes
- **@click / v-on** - Event handling
- **computed** - Reactive calculated properties (filteredProducts, cartItems)
- **methods** - Functions for cart management and sorting

## Data Structure

Each class object contains:
```javascript
{
  id: 1,
  title: "Mathematics Advanced",
  description: "Class description",
  price: 45.00,
  image: "images/maths.jpg",
  availableInventory: 10,
  rating: 5,
  category: "Maths",
  location: "London"
}
```

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Notes

- This is a **front-end only** application (no backend)
- Data is **not persistent** (reloads reset the cart)
- Sign in credentials are **hardcoded** (for demonstration purposes)
- No actual payment processing

## Future Enhancements

Potential features to add:
- Backend integration with database
- Real user authentication
- Payment gateway integration
- Order history
- User profiles
- Email notifications
- Mobile responsive design improvements

## Author

Created as a university project demonstrating Vue.js framework capabilities.

## License

Educational project - free to use and modify.
