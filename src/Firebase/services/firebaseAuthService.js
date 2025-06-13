// src/services/firebaseAuthService.js
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { setFirebaseAuth, clearFirebaseAuth } from '../utils/storage';

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.initAuthListener();
  }

  // Initialize auth state listener
  initAuthListener() {
    console.log("👂 Initializing Firebase auth state listener...");
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        console.log(`✅ Firebase user state changed - User logged in: ${user.uid}`);
      } else {
        console.log("❌ Firebase user state changed - User logged out");
      }
    });
  }

  // Admin Login with Email and Password
  async adminLogin(email, password) {
    try {
      console.log("🔐 Starting Firebase admin login...");
      console.log(`📧 Email: ${email}`);
      
      // Validate inputs
      if (!email || !password) {
        console.log("❌ Missing email or password");
        throw new Error('Email and password are required');
      }

      console.log("🔍 Attempting Firebase sign in...");
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log(`✅ Firebase sign in successful - UID: ${user.uid}`);

      // Get ID Token
      console.log("🎫 Fetching Firebase ID token...");
      const idToken = await getIdToken(user);
      console.log(`✅ ID Token obtained - Length: ${idToken.length} characters`);

      // Store Firebase auth data
      console.log("💾 Storing Firebase auth data...");
      const authStored = setFirebaseAuth(user.uid, idToken);
      
      if (!authStored) {
        console.log("❌ Failed to store Firebase auth data");
        throw new Error('Failed to store authentication data');
      }

      console.log("✅ Firebase auth data stored successfully");

      const result = {
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          idToken: idToken
        },
        message: 'Firebase authentication successful'
      };

      console.log("🎉 Firebase admin login completed successfully");
      return result;

    } catch (error) {
      console.error("❌ Firebase login error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Authentication failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Admin account not found';
          console.log("🚫 Error: Admin account not found");
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password';
          console.log("🚫 Error: Invalid password");
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          console.log("🚫 Error: Invalid email format");
          break;
        case 'auth/user-disabled':
          errorMessage = 'Admin account has been disabled';
          console.log("🚫 Error: Account disabled");
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          console.log("🚫 Error: Too many attempts");
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          console.log("🚫 Error: Network issue");
          break;
        default:
          errorMessage = error.message || 'Authentication failed';
          console.log(`🚫 Error: ${error.code || 'Unknown'} - ${errorMessage}`);
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  // Get current ID Token
  async getCurrentIdToken() {
    try {
      console.log("🎫 Getting current Firebase ID token...");
      
      if (!this.currentUser) {
        console.log("❌ No user currently signed in");
        throw new Error('No user currently signed in');
      }

      console.log("🔄 Forcing token refresh...");
      const idToken = await getIdToken(this.currentUser, true); // Force refresh
      console.log(`✅ Fresh ID token obtained - Length: ${idToken.length} characters`);
      
      return {
        success: true,
        idToken: idToken
      };
    } catch (error) {
      console.error("❌ Error getting ID token:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Admin Logout
  async adminLogout() {
    try {
      console.log("🚪 Starting Firebase admin logout...");
      
      if (this.currentUser) {
        console.log(`👤 Logging out user: ${this.currentUser.uid}`);
      }
      
      await signOut(auth);
      console.log("✅ Firebase sign out successful");
      
      console.log("🧹 Clearing Firebase auth storage...");
      clearFirebaseAuth();
      console.log("✅ Firebase auth storage cleared");
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error("❌ Firebase logout error:", error);
      
      // Clear storage even if signOut fails
      console.log("🧹 Force clearing Firebase auth storage...");
      clearFirebaseAuth();
      
      return {
        success: false,
        error: error.message,
        message: 'Logout completed with errors'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const isAuth = !!this.currentUser;
    console.log(`🔍 Firebase authentication check: ${isAuth ? 'Authenticated' : 'Not Authenticated'}`);
    if (this.currentUser) {
      console.log(`👤 Current user UID: ${this.currentUser.uid}`);
    }
    return isAuth;
  }

  // Get current user
  getCurrentUser() {
    console.log(`👤 Getting current user: ${this.currentUser ? this.currentUser.uid : 'None'}`);
    return this.currentUser;
  }
}

// Export singleton instance
export default new FirebaseAuthService();