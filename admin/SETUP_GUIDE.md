# Quick Setup Guide - Caffeine Craze Admin Panel

## Step-by-Step Setup

### Step 1: Configure Firebase (CRITICAL!)

**File to Edit**: `admin/js/firebase-admin.js`

Find this section (around line 30):
```javascript
const firebaseConfig = {
  // Add your Firebase config here
};
```

Replace it with your Firebase project credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**⚠️ IMPORTANT**: This MUST match the configuration in your main project's `firestore.js` file!

### Step 2: Set Up Firestore Collections

Go to Firebase Console → Firestore Database and create these collections:

1. **users** - For user accounts
2. **products** - For menu items
3. **orders** - For customer orders
4. **counters** - For sequential order IDs

### Step 3: Add Sample Data (Optional)

#### Add a Product:
Go to Firestore → `products` collection → Add Document

```javascript
{
  name: "Cappuccino",
  category: "Hot Coffee",
  description: "Rich and creamy Italian coffee",
  price: 150,
  imageUrl: "capuccino.jpeg",
  isAvailable: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Step 4: Create Your Admin Account

#### Method 1: Via Website Registration
1. Go to your website's registration page
2. Register with your email and password
3. Go to Firebase Console → Firestore → `users` collection
4. Find your user document (by email or UID)
5. Click "Edit"
6. Add field: `isAdmin` → Boolean → `true`
7. Save

#### Method 2: Manually in Firestore
Go to Firestore → `users` collection → Add Document

```javascript
Document ID: [Use your Firebase Auth UID]
{
  email: "admin@example.com",
  displayName: "Admin User",
  phoneNumber: "",
  isAdmin: true,
  accountStatus: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  orders: []
}
```

⚠️ **Note**: If creating manually, you must also create the user in Firebase Authentication!

### Step 5: Set Up Security Rules

Go to Firebase Console → Firestore Database → Rules

Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || request.auth.uid == userId;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
      allow write: if isAdmin();
    }
    
    match /counters/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Click **Publish** to save the rules.

### Step 6: Test the Admin Panel

1. Open your browser
2. Navigate to: `your-domain.com/admin/login.html` (or `file:///path/to/project/admin/login.html` for local testing)
3. Login with your admin credentials
4. You should see the dashboard!

## Testing Checklist

- [ ] Can log in with admin account
- [ ] Dashboard shows statistics
- [ ] Can view products list
- [ ] Can add/edit/delete products
- [ ] Can view orders list
- [ ] Can update order status
- [ ] Can view users list
- [ ] Can edit user details
- [ ] Can change user status

## Common Issues & Solutions

### Issue 1: "Firebase config not found" error
**Solution**: Make sure you've added your Firebase configuration in `admin/js/firebase-admin.js`

### Issue 2: "Permission denied" errors
**Solution**: 
- Check that your Firestore security rules are set up correctly
- Verify the user has `isAdmin: true` in Firestore

### Issue 3: Can't see any data
**Solution**:
- Make sure collections exist in Firestore
- Check that Firebase config matches your project
- Open browser console to see specific errors

### Issue 4: Login fails
**Solution**:
- Verify the email and password are correct
- Check that the user exists in Firebase Authentication
- Confirm the user has `isAdmin: true` in the users collection

### Issue 5: Images not loading
**Solution**:
- Image paths should be relative (e.g., `capuccino.jpeg`, not `images/capuccino.jpeg`)
- Make sure images exist in your project root or specified folder
- Update product `imageUrl` fields to match actual file names

## Directory Structure

```
your-project/
├── admin/                    ← NEW Admin folder
│   ├── css/
│   │   └── admin-style.css
│   ├── js/
│   │   └── firebase-admin.js  ← EDIT THIS with your Firebase config
│   ├── index.html            ← Dashboard
│   ├── login.html            ← Login page (START HERE)
│   ├── products.html
│   ├── orders.html
│   ├── users.html
│   ├── README.md
│   └── SETUP_GUIDE.md        ← This file
├── images/                   ← Product images
├── index.html                ← Main website
├── firestore.js              ← Main Firebase config (MUST MATCH admin config!)
└── ... (other website files)
```

## Next Steps

1. ✅ Configure Firebase in `firebase-admin.js`
2. ✅ Create admin user in Firestore
3. ✅ Set up security rules
4. ✅ Test login at `/admin/login.html`
5. ✅ Add products through admin panel
6. ✅ Test ordering on main website
7. ✅ Verify orders appear in admin panel

## Important Reminders

1. **Firebase Config**: Must be identical in both `admin/js/firebase-admin.js` and your main project's `firestore.js`
2. **Admin User**: Must have `isAdmin: true` in Firestore users collection
3. **Security Rules**: Must be set up to allow admin operations
4. **HTTPS**: Use HTTPS in production for security
5. **Backup**: Always backup your Firestore data before making changes

## Need Help?

If you're stuck:
1. Open browser console (F12) and check for errors
2. Verify all files are in the correct locations
3. Double-check Firebase configuration
4. Review Firestore security rules
5. Ensure admin user has proper permissions

---

**🎉 Once everything is set up, you'll have a fully functional admin panel to manage your Caffeine Craze website!**
