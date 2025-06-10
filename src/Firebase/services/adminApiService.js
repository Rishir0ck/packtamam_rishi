// src/services/adminService.js
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth } from '../config/firebase';
import Cookies from 'js-cookie';

class AdminService {
  constructor() {
    this.currentUser = null;
    this.serverToken = null;
    this.baseURL = process.env.REACT_APP_API_URL || 'http://167.71.228.10:3000';
    this.initAuthListener();
    
    // Log the base URL for debugging
    console.log(`🌐 Admin Service initialized with base URL: ${this.baseURL}`);
  }

  // ========== FIREBASE AUTH METHODS ==========
  
  initAuthListener() {
    console.log("👂 Initializing Firebase auth state listener...");
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        console.log(`✅ Firebase user state changed - User logged in: ${user.uid}`);
      } else {
        console.log("❌ Firebase user state changed - User logged out");
        this.clearAllAuth();
      }
    });
  }

  async firebaseLogin(email, password) {
    try {
      console.log("🔐 Starting Firebase admin login...");
      console.log(`📧 Email: ${email}`);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log(`✅ Firebase sign in successful - UID: ${user.uid}`);

      const idToken = await getIdToken(user);
      console.log(`✅ ID Token obtained - Length: ${idToken.length} characters`);

      // Store Firebase auth data
      this.setFirebaseAuth(user.uid, idToken);

      return {
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          idToken: idToken
        },
        message: 'Firebase authentication successful'
      };

    } catch (error) {
      console.error("❌ Firebase login error:", error);
      return this.handleFirebaseError(error);
    }
  }

  async firebaseLogout() {
    try {
      console.log("🚪 Starting Firebase logout...");
      
      await signOut(auth);
      console.log("✅ Firebase sign out successful");
      
      this.clearAllAuth();
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error("❌ Firebase logout error:", error);
      this.clearAllAuth(); // Force clear even if signOut fails
      
      return {
        success: false,
        error: error.message,
        message: 'Logout completed with errors'
      };
    }
  }

  // ========== SERVER AUTH METHODS ==========

  async serverLogin(firebaseIdToken) {
    try {
      console.log("🔐 Starting server authentication...");
      console.log(`🌐 Server URL: ${this.baseURL}/api/admin/login/admin-email-password`);
      
      const response = await fetch(`${this.baseURL}/api/admin/login/admin-email-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: firebaseIdToken
        })
      });

      console.log(`📡 Server response status: ${response.status} ${response.statusText}`);
      
      // Check if response is HTML (404/error page)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Server returned non-JSON response:', textResponse.substring(0, 200));
        throw new Error(`Server endpoint not found. Expected JSON but got ${contentType}. Check if your API server is running and the endpoint exists.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server authentication failed with status ${response.status}`);
      }

      console.log("✅ Server authentication successful");
      
      // Store server token
      if (data.token) {
        this.setServerAuth(data.token);
        this.serverToken = data.token;
      }

      return {
        success: true,
        data: data,
        message: 'Server authentication successful'
      };

    } catch (error) {
      console.error("❌ Server login error:", error);
      return {
        success: false,
        error: error.message || 'Server authentication failed'
      };
    }
  }

  // ========== COMPLETE LOGIN FLOW ==========

  async login(email, password) {
    try {
      console.log("🚀 Starting complete admin login flow...");

      // Step 1: Firebase Authentication
      const firebaseResult = await this.firebaseLogin(email, password);
      if (!firebaseResult.success) {
        return firebaseResult;
      }

      // Step 2: Server Authentication
      const serverResult = await this.serverLogin(firebaseResult.data.idToken);
      if (!serverResult.success) {
        // If server auth fails, logout from Firebase
        await this.firebaseLogout();
        return serverResult;
      }

      console.log("🎉 Complete admin login successful!");
      
      return {
        success: true,
        data: {
          firebase: firebaseResult.data,
          server: serverResult.data
        },
        message: 'Login successful'
      };

    } catch (error) {
      console.error("❌ Complete login error:", error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  async logout() {
    console.log("🚪 Starting complete logout...");
    const result = await this.firebaseLogout();
    console.log("✅ Complete logout finished");
    return result;
  }

  // ========== BUSINESS MANAGEMENT API METHODS ==========

  async getPendingBusinessList(page = 1, perPage = 10) {
    return this.makeAuthenticatedRequest('GET', `/api/admin/pending-business-list?page=${page}&per_page=${perPage}`);
  }

  async getRejectedBusinessList(page = 1, perPage = 10) {
    return this.makeAuthenticatedRequest('GET', `/api/admin/rejected-business-list?page=${page}&per_page=${perPage}`);
  }

  async getApprovedBusinessList(page = 1, perPage = 10) {
    return this.makeAuthenticatedRequest('GET', `/api/admin/approved-business-list?page=${page}&per_page=${perPage}`);
  }

  async getQueryBusinessList(page = 1, perPage = 10) {
    return this.makeAuthenticatedRequest('GET', `/api/admin/query-business-list?page=${page}&per_page=${perPage}`);
  }

  async updateBusinessStatus(id, status, queryMessage = null) {
    const payload = {
      id,
      status, // 'Pending', 'Approved', 'Rejected', 'Query'
    };

    if (status === 'Query' && queryMessage) {
      payload.query_message = queryMessage;
    }

    return this.makeAuthenticatedRequest('POST', '/api/admin/update-business-status', payload);
  }

  
  // ========== OUTLET MANAGEMENT API METHODS ==========

  async getOutlets() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/outlets');
  }

  async addOutlet(name) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add-outlet', { name });
  }

  async updateOutlet(id, isActive) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/update-outlet', {
      id,
      is_active: isActive
    });
  }

  // ========== SUB ADMIN MANAGEMENT API METHODS ==========

  async addSubAdmin(email, name) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add-sub-admin', {
      email,
      name
    });
  }

  async deleteSubAdmin(id) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/delete-sub-admin', { id });
  }

  async listSubAdmins() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/list-sub-admin');
  }

  // ========== PRICING MANAGEMENT API METHODS ==========

  async listPriceSlabs() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/list-price-slabs');
  }

  async updatePriceSlab(id, minQty, maxQty, pricePerUnit) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/update-price-slabs', {
      id,
      min_qty: minQty,
      max_qty: maxQty,
      price_per_unit: pricePerUnit
    });
  }

  async addPriceSlab(minQty, maxQty, pricePerUnit) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add-price-slabs', {
      min_qty: minQty,
      max_qty: maxQty,
      price_per_unit: pricePerUnit
    });
  }

  // ========== INVENTORY/PRODUCT MANAGEMENT API METHODS ==========

  async getProducts(categoryId = null, name = '') {
    let queryParams = [];
    
    if (categoryId) {
      queryParams.push(`category_id=${categoryId}`);
    }
    
    if (name) {
      queryParams.push(`name=${encodeURIComponent(name)}`);
    }
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    
    return this.makeAuthenticatedRequest('GET', `/api/admin/products${queryString}`);
  }

  async getCategories(categoryId = null) {
    const queryString = categoryId ? `?category_id=${categoryId}` : '';
    return this.makeAuthenticatedRequest('GET', `/api/admin/categories${queryString}`);
  }

  async getMaterials() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/materials');
  }

  async addProduct(productData) {
    // Use FormData for file uploads and form data
    const formData = new FormData();
    
    // Add all the product fields to FormData
    formData.append('name', productData.name || '');
    formData.append('category_id', productData.category_id || '');
    formData.append('material_id', productData.material_id || '');
    formData.append('hsn_code', productData.hsn_code || '');
    formData.append('shape', productData.shape || '');
    formData.append('colour', productData.colour || '');
    formData.append('specs', productData.specs || '');
    formData.append('quality', productData.quality || '');

    // Add images if provided
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image) => {
        if (image.originFileObj) {
          formData.append(`images`, image.originFileObj);
        }
      });
    }

    return this.makeFormDataRequest('POST', '/api/admin/add-products', formData);
  }

  async updateProduct(productId, productData) {
    const formData = new FormData();
    
    // Add product ID
    formData.append('id', productId);
    
    // Add all the product fields to FormData
    formData.append('name', productData.name || '');
    formData.append('category_id', productData.category_id || '');
    formData.append('material_id', productData.material_id || '');
    formData.append('hsn_code', productData.hsn_code || '');
    formData.append('shape', productData.shape || '');
    formData.append('colour', productData.colour || '');
    formData.append('specs', productData.specs || '');
    formData.append('quality', productData.quality || '');

    // Add images if provided
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image) => {
        if (image.originFileObj) {
          formData.append(`images`, image.originFileObj);
        }
      });
    }

    return this.makeFormDataRequest('POST', '/api/admin/update-products', formData);
  }

  async deleteProduct(productId) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/delete-products', { id: productId });
  }

  // ========== USER DATA API METHODS ==========

  async getUserData() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/get-data');
  }

  // ========== UTILITY METHODS ==========

  async makeAuthenticatedRequest(method, endpoint, data = null) {
    try {
      const token = this.getServerAuth();
      
      if (!token) {
        console.error('❌ No authentication token found');
        throw new Error('No authentication token found. Please login again.');
      }

      const fullURL = `${this.baseURL}${endpoint}`;
      console.log(`📡 Making ${method} request to ${fullURL}`);

      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
        console.log(`📦 Request payload:`, data);
      }

      const response = await fetch(fullURL, config);
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      console.log(`📡 Response headers:`, Object.fromEntries([...response.headers]));

      // Check if response is HTML (404/error page)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Server returned non-JSON response:', textResponse.substring(0, 500));
        
        // Provide more specific error messages
        if (response.status === 404) {
          throw new Error(`API endpoint not found: ${endpoint}. Please check if your server is running and the endpoint exists.`);
        } else if (response.status >= 500) {
          throw new Error(`Server error (${response.status}). Please check your server logs.`);
        } else {
          throw new Error(`Expected JSON response but got ${contentType || 'unknown type'}. Server may be returning an error page.`);
        }
      }

      const responseData = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          console.log("🔑 Token expired, clearing auth...");
          this.clearAllAuth();
          throw new Error('Session expired. Please login again.');
        }
        
        console.error('❌ API Error Response:', responseData);
        throw new Error(responseData.message || responseData.error || `Request failed with status ${response.status}`);
      }

      console.log(`✅ ${method} request to ${endpoint} successful`);
      console.log(`📦 Response data:`, responseData);
      
      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error(`❌ ${method} request to ${endpoint} failed:`, error);
      
      // Provide more helpful error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: `Cannot connect to server at ${this.baseURL}. Please check if your API server is running.`
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async makeFormDataRequest(method, endpoint, formData) {
    try {
      const token = this.getServerAuth();
      
      if (!token) {
        console.error('❌ No authentication token found');
        throw new Error('No authentication token found. Please login again.');
      }

      const fullURL = `${this.baseURL}${endpoint}`;
      console.log(`📡 Making ${method} FormData request to ${fullURL}`);

      const config = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      };

      const response = await fetch(fullURL, config);
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      // Check if response is HTML (404/error page)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Server returned non-JSON response:', textResponse.substring(0, 500));
        
        if (response.status === 404) {
          throw new Error(`API endpoint not found: ${endpoint}. Please check if your server is running and the endpoint exists.`);
        } else if (response.status >= 500) {
          throw new Error(`Server error (${response.status}). Please check your server logs.`);
        } else {
          throw new Error(`Expected JSON response but got ${contentType || 'unknown type'}. Server may be returning an error page.`);
        }
      }

      const responseData = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          console.log("🔑 Token expired, clearing auth...");
          this.clearAllAuth();
          throw new Error('Session expired. Please login again.');
        }
        
        console.error('❌ API Error Response:', responseData);
        throw new Error(responseData.message || responseData.error || `Request failed with status ${response.status}`);
      }

      console.log(`✅ ${method} FormData request to ${endpoint} successful`);
      console.log(`📦 Response data:`, responseData);
      
      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error(`❌ ${method} FormData request to ${endpoint} failed:`, error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: `Cannot connect to server at ${this.baseURL}. Please check if your API server is running.`
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCurrentIdToken() {
    try {
      if (!this.currentUser) {
        throw new Error('No user currently signed in');
      }

      const idToken = await getIdToken(this.currentUser, true); // Force refresh
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

  // ========== STORAGE METHODS ==========

  setFirebaseAuth(uid, idToken) {
    try {
      console.log("💾 Storing Firebase auth data...");
      localStorage.setItem('firebase_uid', uid);
      localStorage.setItem('firebase_id_token', idToken);
      console.log("✅ Firebase auth data stored successfully");
      return true;
    } catch (error) {
      console.error("❌ Error storing Firebase auth:", error);
      return false;
    }
  }

  getFirebaseAuth() {
    try {
      const uid = localStorage.getItem('firebase_uid');
      const idToken = localStorage.getItem('firebase_id_token');
      return { uid, idToken };
    } catch (error) {
      console.error("❌ Error retrieving Firebase auth:", error);
      return { uid: null, idToken: null };
    }
  }

  clearFirebaseAuth() {
    try {
      console.log("🧹 Clearing Firebase auth data...");
      localStorage.removeItem('firebase_uid');
      localStorage.removeItem('firebase_id_token');
      console.log("✅ Firebase auth data cleared");
      return true;
    } catch (error) {
      console.error("❌ Error clearing Firebase auth:", error);
      return false;
    }
  }

  setServerAuth(token) {
    try {
      console.log("💾 Storing server auth token...");
      Cookies.set('admin_token', token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      console.log("✅ Server auth token stored successfully");
      return true;
    } catch (error) {
      console.error("❌ Error storing server auth token:", error);
      return false;
    }
  }

  getServerAuth() {
    try {
      const token = Cookies.get('admin_token');
      return token || null;
    } catch (error) {
      console.error("❌ Error retrieving server auth token:", error);
      return null;
    }
  }

  clearServerAuth() {
    try {
      console.log("🧹 Clearing server auth token...");
      Cookies.remove('admin_token');
      console.log("✅ Server auth token cleared");
      return true;
    } catch (error) {
      console.error("❌ Error clearing server auth token:", error);
      return false;
    }
  }

  clearAllAuth() {
    console.log("🧹 Starting complete auth data cleanup...");
    const firebaseCleared = this.clearFirebaseAuth();
    const serverCleared = this.clearServerAuth();
    this.serverToken = null;
    console.log("✅ Complete auth cleanup finished");
    return firebaseCleared && serverCleared;
  }

  // ========== STATUS METHODS ==========

  isAuthenticated() {
    const firebaseAuth = !!this.currentUser;
    const serverAuth = !!this.getServerAuth();
    const isAuth = firebaseAuth && serverAuth;
    
    console.log(`🔍 Authentication check:`);
    console.log(`  Firebase: ${firebaseAuth ? 'Authenticated' : 'Not Authenticated'}`);
    console.log(`  Server: ${serverAuth ? 'Authenticated' : 'Not Authenticated'}`);
    console.log(`  Overall: ${isAuth ? 'Authenticated' : 'Not Authenticated'}`);
    
    return isAuth;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getAuthTokens() {
    const firebase = this.getFirebaseAuth();
    const server = this.getServerAuth();
    
    return {
      firebase: firebase,
      server: server,
      isComplete: !!(firebase.uid && firebase.idToken && server)
    };
  }

  // ========== DEBUGGING METHODS ==========

  async testConnection() {
    try {
      console.log("🔍 Testing API connection...");
      console.log(`🌐 Base URL: ${this.baseURL}`);
      
      // Test simple connection first
      const response = await fetch(this.baseURL, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log(`📡 Connection test status: ${response.status} ${response.statusText}`);
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        baseURL: this.baseURL
      };
    } catch (error) {
      console.error("❌ Connection test failed:", error);
      return {
        success: false,
        error: error.message,
        baseURL: this.baseURL
      };
    }
  }

  getDebugInfo() {
    const auth = this.getAuthTokens();
    return {
      baseURL: this.baseURL,
      currentUser: this.currentUser ? {
        uid: this.currentUser.uid,
        email: this.currentUser.email
      } : null,
      authentication: {
        firebase: !!auth.firebase.uid,
        server: !!auth.server,
        complete: auth.isComplete
      },
      tokens: {
        firebase: auth.firebase.uid ? 'Present' : 'Missing',
        server: auth.server ? 'Present' : 'Missing'
      }
    };
  }

  // ========== ERROR HANDLING ==========

  handleFirebaseError(error) {
    let errorMessage = 'Authentication failed';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Admin account not found';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Invalid password';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Admin account has been disabled';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      default:
        errorMessage = error.message || 'Authentication failed';
    }

    console.log(`🚫 Firebase Error: ${error.code || 'Unknown'} - ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
      code: error.code
    };
  }
}

// Export singleton instance
export default new AdminService();