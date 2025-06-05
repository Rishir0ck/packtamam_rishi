// services/firebase_auth_service.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../config/auth";

// API Configuration
const API_BASE_URL = "http://167.71.228.10:3000/api";
const API_ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login/admin-email-password`
};

// Cookie utilities
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
  console.log(`🍪 Cookie SET: ${name} = ${value.substring(0, 20)}...`);
};

const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  console.log(`🗑️ Cookie REMOVED: ${name}`);
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      console.log(`🍪 Cookie GET: ${name} = ${value ? value.substring(0, 20) + '...' : 'null'}`);
      return value;
    }
  }
  console.log(`🍪 Cookie GET: ${name} = null (not found)`);
  return null;
};

// Authentication service class
class FirebaseAuthService {
  
  // Call Node.js API with idToken
  async callAdminLoginAPI(idToken) {
    try {
      console.log("🌐 Calling Node.js Admin Login API...");
      console.log(`   API URL: ${API_ENDPOINTS.ADMIN_LOGIN}`);
      console.log(`   Token preview: ${idToken.substring(0, 50)}...`);
      
      const response = await fetch(API_ENDPOINTS.ADMIN_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          idToken: idToken
        })
      });

      console.log(`📡 API Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error Response: ${errorText}`);
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
      }

      const apiData = await response.json();
      console.log("✅ Node.js API Response:", apiData);
      
      return {
        success: true,
        data: apiData,
        message: "API authentication successful"
      };
    } catch (error) {
      console.error("❌ Node.js API call error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to authenticate with backend API"
      };
    }
  }

  // Sign up with email and password
  async signUp(email, password, fullName) {
    try {
      console.log("🔐 Starting sign up process...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ User created successfully:");
      console.log(`   UID: ${user.uid}`);
      console.log(`   Email: ${user.email}`);
      
      // Update user profile with full name
      await updateProfile(user, {
        displayName: fullName
      });
      console.log(`✅ Profile updated with displayName: ${fullName}`);
      
      // Get JWT token
      const token = await user.getIdToken();
      console.log("🎫 JWT Token obtained:");
      console.log(`   Token length: ${token.length} characters`);
      console.log(`   Token preview: ${token.substring(0, 50)}...`);
      
      // Store UID and JWT token in cookies
      console.log("💾 Storing user data in cookies...");
      setCookie('userUID', user.uid);
      setCookie('userToken', token);
      setCookie('userName', fullName);
      setCookie('userEmail', email);
      
      console.log("✅ Sign up completed successfully!");
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: fullName,
          token
        },
        message: "Account created successfully!"
      };
    } catch (error) {
      console.error("❌ Sign up error:", error);
      console.error(`   Error code: ${error.code}`);
      console.error(`   Error message: ${error.message}`);
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with email and password - Updated to integrate with Node.js API
  async signIn(email, password) {
    try {
      console.log("🔐 Starting sign in process...");
      
      // Step 1: Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Firebase authentication successful:");
      console.log(`   UID: ${user.uid}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Display Name: ${user.displayName || 'Not set'}`);
      
      // Step 2: Get JWT token from Firebase
      const token = await user.getIdToken();
      console.log("🎫 Firebase JWT Token obtained:");
      console.log(`   Token length: ${token.length} characters`);
      console.log(`   Token preview: ${token.substring(0, 50)}...`);
      
      // Step 3: Call Node.js API with the idToken
      console.log("🌐 Calling Node.js API for backend authentication...");
      const apiResult = await this.callAdminLoginAPI(token);
      
      if (!apiResult.success) {
        console.error("❌ Backend API authentication failed:", apiResult.error);
        // You can choose to proceed with Firebase auth only or fail completely
        // For now, we'll log the error but continue with Firebase auth
        console.warn("⚠️ Continuing with Firebase authentication only");
      } else {
        console.log("✅ Backend API authentication successful");
        // Store any additional data from the API response if needed
        if (apiResult.data) {
          setCookie('apiAuthData', JSON.stringify(apiResult.data));
        }
      }
      
      // Step 4: Store user data in cookies
      console.log("💾 Storing user data in cookies...");
      setCookie('userUID', user.uid);
      setCookie('userToken', token);
      setCookie('userName', user.displayName || '');
      setCookie('userEmail', user.email);
      
      console.log("✅ Complete sign in process finished!");
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          token
        },
        apiResult: apiResult, // Include API result for debugging
        message: apiResult.success 
          ? "Login successful! Backend authenticated." 
          : "Login successful! (Firebase only - Backend API unavailable)"
      };
    } catch (error) {
      console.error("❌ Sign in error:", error);
      console.error(`   Error code: ${error.code}`);
      console.error(`   Error message: ${error.message}`);
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email) {
    try {
      console.log("📧 Starting password reset process...");
      console.log(`   Email: ${email}`);
      
      await sendPasswordResetEmail(auth, email);
      
      console.log("✅ Password reset email sent successfully!");
      console.log(`   Email sent to: ${email}`);
      
      return {
        success: true,
        message: "Password reset email sent successfully!"
      };
    } catch (error) {
      console.error("❌ Password reset email error:", error);
      console.error(`   Error code: ${error.code}`);
      console.error(`   Error message: ${error.message}`);
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign out - Updated to clear API auth data
  async signOut() {
    try {
      console.log("🚪 Starting sign out process...");
      await signOut(auth);
      console.log("✅ Firebase sign out successful");
      
      // Remove all cookies including API auth data
      console.log("🗑️ Removing user data cookies...");
      removeCookie('userUID');
      removeCookie('userToken');
      removeCookie('userName');
      removeCookie('userEmail');
      removeCookie('apiAuthData');
      
      console.log("✅ Complete sign out process finished!");
      
      return {
        success: true,
        message: "Logged out successfully!"
      };
    } catch (error) {
      console.error("❌ Sign out error:", error);
      console.error(`   Error code: ${error.code}`);
      console.error(`   Error message: ${error.message}`);
      return {
        success: false,
        error: error.code,
        message: "Error logging out"
      };
    }
  }

  // Check if user is authenticated by checking cookies
  isAuthenticated() {
    console.log("🔍 Checking authentication status...");
    const uid = getCookie('userUID');
    const token = getCookie('userToken');
    const isAuth = uid && token;
    console.log(`🔐 Authentication status: ${isAuth ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'}`);
    if (isAuth) {
      console.log(`   UID found: ${uid}`);
      console.log(`   Token found: ${token ? 'Yes' : 'No'}`);
    }
    return isAuth;
  }

  // Get current user data from cookies - Updated to include API auth data
  getCurrentUser() {
    console.log("👤 Getting current user from cookies...");
    if (this.isAuthenticated()) {
      const apiAuthData = getCookie('apiAuthData');
      const userData = {
        uid: getCookie('userUID'),
        token: getCookie('userToken'),
        displayName: getCookie('userName'),
        email: getCookie('userEmail'),
        apiAuthData: apiAuthData ? JSON.parse(apiAuthData) : null
      };
      console.log("✅ Current user data retrieved:");
      console.log(`   UID: ${userData.uid}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Display Name: ${userData.displayName}`);
      console.log(`   Token: ${userData.token ? 'Present' : 'Missing'}`);
      console.log(`   API Auth Data: ${userData.apiAuthData ? 'Present' : 'Missing'}`);
      return userData;
    }
    console.log("❌ No authenticated user found");
    return null;
  }

  // Refresh token - Updated to re-authenticate with API
  async refreshToken() {
    try {
      console.log("🔄 Starting token refresh...");
      if (auth.currentUser) {
        console.log(`   Current user UID: ${auth.currentUser.uid}`);
        const token = await auth.currentUser.getIdToken(true);
        console.log("✅ Refresh token obtained:");
        console.log(`   New token length: ${token.length} characters`);
        console.log(`   New token preview: ${token.substring(0, 50)}...`);
        
        // Re-authenticate with Node.js API using the new token
        console.log("🌐 Re-authenticating with Node.js API...");
        const apiResult = await this.callAdminLoginAPI(token);
        
        console.log("💾 Storing refreshed token in cookies...");
        setCookie('userToken', token);
        
        if (apiResult.success && apiResult.data) {
          setCookie('apiAuthData', JSON.stringify(apiResult.data));
        }
        
        console.log("✅ Token refresh completed successfully!");
        return token;
      } else {
        console.log("❌ No current user found for token refresh");
        return null;
      }
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      console.error(`   Error code: ${error.code}`);
      console.error(`   Error message: ${error.message}`);
      return null;
    }
  }

  // Get user-friendly error messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please use a different email or try logging in.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
      'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'auth/missing-email': 'Please enter your email address.',
      'auth/invalid-action-code': 'The password reset link is invalid or has expired.',
      'auth/expired-action-code': 'The password reset link has expired. Please request a new one.',
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    console.log(`📧 Email validation: ${email} - ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  }

  // Validate password strength
  validatePassword(password) {
    const result = {
      isValid: password.length >= 6,
      message: password.length >= 6 ? '' : 'Password must be at least 6 characters long'
    };
    console.log(`🔒 Password validation: Length ${password.length} - ${result.isValid ? 'VALID' : 'INVALID'}`);
    return result;
  }
}

// Export singleton instance
export default new FirebaseAuthService();