# Caffeine Craze Admin Panel

## Overview
This admin panel provides complete management functionality for the Caffeine Craze website. It's built with HTML, CSS, JavaScript, and Firebase/Firestore for data management.

## Features

### 1. Dashboard
- **Statistics Overview**: View total orders, revenue, users, and products
- **Recent Orders**: Quick view of the latest 5 orders
- **Visual Cards**: Color-coded cards for different metrics

### 2. Products Management
- **Add New Products**: Create new menu items with name, category, description, price, and image
- **Edit Products**: Update existing product details
- **Delete Products**: Remove products from the menu
- **Filter & Search**: Filter by category, availability, or search by name/description
- **Availability Toggle**: Mark products as available or unavailable

### 3. Orders Management
- **View All Orders**: See complete order history
- **Order Details**: View full order information including customer details and items
- **Update Status**: Change order status (Pending, Processing, Delivered, Cancelled)
- **Payment Method**: Update payment method for orders
- **Filter & Search**: Filter by status, date range, or search by order ID/customer name

### 4. Users Management
- **View All Users**: See all registered customers
- **User Details**: View user information and order history
- **Edit Users**: Update user details (name, phone)
- **Change Status**: Set user account status (Active, Inactive, Suspended)
- **Filter & Search**: Filter by status or search by name/email

## Setup Instructions

### 1. Firebase Configuration
Before the admin panel will work, you need to configure Firebase:

1. Open `admin/js/firebase-admin.js`
2. Replace the empty `firebaseConfig` object with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Make sure this matches the Firebase configuration in your main project's `firestore.js`

### 2. Firestore Database Structure

Your Firestore database should have the following collections:

#### Users Collection (`users`)
```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  phoneNumber: "1234567890",
  isAdmin: true/false,  // IMPORTANT: Set to true for admin users
  accountStatus: "active", // or "inactive", "suspended"
  createdAt: "ISO timestamp",
  lastLogin: "ISO timestamp",
  orders: ["order1", "order2"] // array of order IDs
}
```

#### Products Collection (`products`)
```javascript
{
  name: "Cappuccino",
  category: "Coffee",
  description: "Rich and creamy coffee",
  price: 150,
  imageUrl: "capuccino.jpeg",
  isAvailable: true,
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

#### Orders Collection (`orders`)
```javascript
{
  orderId: 1, // Sequential number
  userId: "firebase-uid",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "1234567890",
  customerAddress: "123 Main St",
  items: [
    {
      name: "Cappuccino",
      quantity: 2,
      price: 150
    }
  ],
  totalAmount: 300,
  status: "pending", // "processing", "delivered", "cancelled"
  paymentMethod: "cash on delivery",
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

### 3. Creating an Admin User

To create an admin user:

1. First, register a regular user through your website's registration system
2. Go to your Firebase Console → Firestore Database
3. Find the user document in the `users` collection
4. Add a field: `isAdmin` with value `true`
5. Optionally set `accountStatus` to `"active"`

Now this user can log in to the admin panel!

### 4. Accessing the Admin Panel

1. Navigate to: `your-domain.com/admin/login.html`
2. Log in with admin credentials (email and password)
3. You'll be redirected to the dashboard

## Security Considerations

### Important Security Rules

1. **Firebase Security Rules**: Set up Firestore security rules to restrict admin operations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users collection - admins can read/write all, users can only read/write their own
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin();
    }
    
    // Products collection - anyone can read, only admins can write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Orders collection - users can read their own, admins can read/write all
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }
  }
}
```

2. **HTTPS Only**: Always use HTTPS in production
3. **Strong Passwords**: Require strong passwords for admin accounts
4. **Limited Admin Access**: Only create admin accounts for trusted users
5. **Regular Audits**: Monitor admin actions through Firebase logs

## File Structure

```
admin/
├── css/
│   └── admin-style.css       # Admin panel styling
├── js/
│   └── firebase-admin.js     # Firebase operations and admin functions
├── index.html                # Dashboard
├── login.html                # Admin login page
├── products.html             # Products management
├── orders.html               # Orders management
├── users.html                # Users management
└── README.md                 # This file
```

## Troubleshooting

### Problem: Can't log in
- **Solution**: Make sure the user has `isAdmin: true` in their Firestore user document
- Check that Firebase config is correct in `firebase-admin.js`

### Problem: Data not loading
- **Solution**: Check browser console for errors
- Verify Firestore security rules allow admin access
- Ensure Firebase project is properly configured

### Problem: Images not showing
- **Solution**: Make sure image filenames in products match actual files in your project
- Check that image paths are correct (should be relative like `capuccino.jpeg`)

### Problem: Orders/Products not saving
- **Solution**: Check Firestore security rules
- Verify you're logged in as an admin user
- Check browser console for specific error messages

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Firebase configuration
3. Review Firestore security rules
4. Check that admin user has proper permissions

## Features to Add (Future Enhancements)

- Export data to CSV/Excel
- Sales analytics and charts
- Email notifications for new orders
- Bulk product upload
- Image upload functionality
- Role-based access (super admin, moderator, etc.)
- Activity logs
- Customer messaging system

---

**Note**: This admin panel is designed to work with Firebase/Firestore. Make sure your main website is also configured to use the same Firebase project for seamless integration.
