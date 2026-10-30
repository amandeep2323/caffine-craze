// Firebase Admin Helper Functions for Caffeine Craze
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  runTransaction
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase configuration - MUST match your project config
const firebaseConfig = {
  apiKey: "AIzaSyAQbW8GZYx8s1TClUiG7r711piLJFtrANA",
  authDomain: "caffinecraze-93d3f.firebaseapp.com",
  projectId: "caffinecraze-93d3f",
  storageBucket: "caffinecraze-93d3f.firebasestorage.app",
  messagingSenderId: "774090459612",
  appId: "1:774090459612:web:28aa1e5d3a3de8d393e719",
  measurementId: "G-Z5VTH06PF5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Admin Service Object
const AdminService = {
  // ========== AUTHENTICATION ==========
  
  // Check if user is logged in and is admin
  checkAuth: async () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin === true) {
            resolve({ success: true, user, isAdmin: true });
          } else {
            resolve({ success: true, user, isAdmin: false });
          }
        } else {
          resolve({ success: false, user: null, isAdmin: false });
        }
      });
    });
  },

  // Admin login
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || !userDoc.data().isAdmin) {
        await signOut(auth);
        return { success: false, error: "You don't have admin privileges" };
      }
      
      // Update last login
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date().toISOString()
      });
      
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  },

  // Admin logout
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get current admin user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // ========== DASHBOARD STATISTICS ==========
  
  getDashboardStats: async () => {
    try {
      // Get total orders
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const totalOrders = ordersSnapshot.size;
      
      // Calculate total revenue (exclude cancelled orders)
      let totalRevenue = 0;
      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        if (order.status !== 'cancelled') {
          totalRevenue += parseFloat(order.totalAmount || 0);
        }
      });
      
      // Get total users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;
      
      // Get total products
      const productsSnapshot = await getDocs(collection(db, "products"));
      const totalProducts = productsSnapshot.size;
      
      // Get recent orders (last 5)
      const recentOrdersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
      const recentOrders = [];
      recentOrdersSnapshot.forEach(doc => {
        recentOrders.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        success: true,
        stats: {
          totalOrders,
          totalRevenue,
          totalUsers,
          totalProducts
        },
        recentOrders
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return { success: false, error: error.message };
    }
  },

  // ========== PRODUCT MANAGEMENT ==========
  
  // Get all products with pagination
  getProducts: async (filters = {}) => {
    try {
      let q = collection(db, "products");
      const products = [];
      
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const data = doc.data();
        // Apply filters
        if (filters.category && data.category !== filters.category) return;
        if (filters.availability !== undefined && data.isAvailable !== filters.availability) return;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (!data.name.toLowerCase().includes(searchLower) && 
              !data.description.toLowerCase().includes(searchLower)) return;
        }
        products.push({ id: doc.id, ...data });
      });
      
      // Get unique categories
      const categories = [...new Set(products.map(p => p.category))];
      
      return { success: true, products, categories };
    } catch (error) {
      console.error("Error getting products:", error);
      return { success: false, error: error.message };
    }
  },

  // Get single product
  getProduct: async (productId) => {
    try {
      const productDoc = await getDoc(doc(db, "products", productId));
      if (!productDoc.exists()) {
        return { success: false, error: "Product not found" };
      }
      return { success: true, product: { id: productDoc.id, ...productDoc.data() } };
    } catch (error) {
      console.error("Error getting product:", error);
      return { success: false, error: error.message };
    }
  },

  // Add new product
  addProduct: async (productData) => {
    try {
      const productRef = doc(collection(db, "products"));
      await setDoc(productRef, {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, productId: productRef.id };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, error: error.message };
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        ...productData,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  },

  // ========== ORDER MANAGEMENT ==========
  
  // Get all orders with pagination
  getOrders: async (filters = {}) => {
    try {
      const orders = [];
      const snapshot = await getDocs(collection(db, "orders"));
      
      for (const orderDoc of snapshot.docs) {
        const data = orderDoc.data();
        
        // Apply filters
        if (filters.status && data.status !== filters.status) continue;
        if (filters.dateFrom && new Date(data.createdAt) < new Date(filters.dateFrom)) continue;
        if (filters.dateTo && new Date(data.createdAt) > new Date(filters.dateTo)) continue;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const customerName = data.customerName || "";
          if (!orderDoc.id.includes(searchLower) && 
              !customerName.toLowerCase().includes(searchLower)) continue;
        }
        
        orders.push({ id: orderDoc.id, ...data });
      }
      
      // Sort by createdAt descending
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return { success: true, orders };
    } catch (error) {
      console.error("Error getting orders:", error);
      return { success: false, error: error.message };
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (!orderDoc.exists()) {
        return { success: false, error: "Order not found" };
      }
      return { success: true, order: { id: orderDoc.id, ...orderDoc.data() } };
    } catch (error) {
      console.error("Error getting order:", error);
      return { success: false, error: error.message };
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, paymentMethod) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
        paymentMethod,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating order:", error);
      return { success: false, error: error.message };
    }
  },

  // ========== USER MANAGEMENT ==========
  
  // Get all users
  getUsers: async (filters = {}) => {
    try {
      const users = [];
      const snapshot = await getDocs(collection(db, "users"));
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Apply filters
        if (filters.status && data.accountStatus !== filters.status) return;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const email = data.email || "";
          const displayName = data.displayName || "";
          if (!email.toLowerCase().includes(searchLower) && 
              !displayName.toLowerCase().includes(searchLower)) return;
        }
        
        users.push({ id: doc.id, ...data });
      });
      
      // Sort by displayName
      users.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
      
      return { success: true, users };
    } catch (error) {
      console.error("Error getting users:", error);
      return { success: false, error: error.message };
    }
  },

  // Get single user
  getUser: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        return { success: false, error: "User not found" };
      }
      
      // Get user's orders
      const ordersSnapshot = await getDocs(
        query(collection(db, "orders"), where("userId", "==", userId))
      );
      const orders = [];
      ordersSnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      return { 
        success: true, 
        user: { id: userDoc.id, ...userDoc.data() },
        orders 
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return { success: false, error: error.message };
    }
  },

  // Update user details
  updateUser: async (userId, userData) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...userData,
        lastUpdated: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  },

  // Update user status
  updateUserStatus: async (userId, accountStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        accountStatus,
        lastUpdated: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating user status:", error);
      return { success: false, error: error.message };
    }
  }
};

export default AdminService;
