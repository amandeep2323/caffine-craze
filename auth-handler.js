// Authentication Handler - Updates navbar based on login status
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase configuration
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
const auth = getAuth(app);

// Update navbar based on authentication state
function updateNavbar(user) {
  const loginNavItem = document.querySelector('.nav-item:last-child');
  
  if (user) {
    // User is logged in - show user menu with dropdown
    const displayName = user.displayName || user.email.split('@')[0];
    
    loginNavItem.innerHTML = `
      <div class="dropdown">
        <a class="nav-link dropdown-toggle" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="usericon.png" alt="User Icon" class="navbar-icon"> ${displayName}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" href="profile.html">
            <i class="bi bi-person"></i> My Profile
          </a></li>
          <li><a class="dropdown-item" href="proceed_button.html">
            <i class="bi bi-cart"></i> My Orders
          </a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="logoutBtn">
            <i class="bi bi-box-arrow-right"></i> Logout
          </a></li>
        </ul>
      </div>
    `;
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          window.location.href = 'index.html';
        } catch (error) {
          console.error('Logout error:', error);
          alert('Error logging out. Please try again.');
        }
      });
    }
  } else {
    // User is logged out - show login link
    loginNavItem.innerHTML = `
      <a class="nav-link" href="spa.html">
        <img src="usericon.png" alt="User Icon" class="navbar-icon"> Login
      </a>
    `;
  }
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  updateNavbar(user);
});

// Export for use in other files
export { auth };
