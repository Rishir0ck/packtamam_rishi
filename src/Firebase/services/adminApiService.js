// src/services/adminService.js
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdToken } from 'firebase/auth';
import { auth } from '../config/firebase';
import Cookies from 'js-cookie';

class AdminService {
  constructor() {
    this.currentUser = null;
    this.serverToken = null;
    this.baseURL = this.getBaseURL();
    this.initAuthListener();
  }

  getBaseURL() {
    return (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
           (typeof window !== 'undefined' && window.ENV?.REACT_APP_API_URL) ||
           'http://167.71.228.10:3000';
  }

  isProduction() {
    const env = (typeof process !== 'undefined' && process.env?.NODE_ENV) ||
                (typeof window !== 'undefined' && window.ENV?.NODE_ENV);
    if (env) return env === 'production';
    return typeof window !== 'undefined' && window.location && 
           !window.location.hostname.includes('localhost') && 
           !window.location.hostname.includes('127.0.0.1');
  }

  initAuthListener() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (!user) this.clearAllAuth();
    });
  }

  // Authentication Methods
  async firebaseLogin(email, password) {
    try {
      if (!email || !password) throw new Error('Email and password are required');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await getIdToken(user);
      
      this.setFirebaseAuth(user.uid, idToken);
      
      return {
        success: true,
        data: { uid: user.uid, email: user.email, idToken },
        message: 'Firebase authentication successful'
      };
    } catch (error) {
      return this.handleFirebaseError(error);
    }
  }

  async firebaseLogout() {
    try {
      await signOut(auth);
      this.clearAllAuth();
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      this.clearAllAuth();
      return { success: false, error: error.message, message: 'Logout completed with errors' };
    }
  }

  async serverLogin(firebaseIdToken) {
    try {
      const response = await fetch(`${this.baseURL}/api/admin/login/admin-email-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: firebaseIdToken })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Server endpoint not found. Expected JSON but got ${contentType}. Check if your API server is running.`);
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Server authentication failed with status ${response.status}`);

      if (data.token) {
        this.setServerAuth(data.token);
        this.serverToken = data.token;
      }

      return { success: true, data, message: 'Server authentication successful' };
    } catch (error) {
      return { success: false, error: error.message || 'Server authentication failed' };
    }
  }

  async login(email, password) {
    try {
      const firebaseResult = await this.firebaseLogin(email, password);
      if (!firebaseResult.success) return firebaseResult;

      const serverResult = await this.serverLogin(firebaseResult.data.idToken);
      if (!serverResult.success) {
        await this.firebaseLogout();
        return serverResult;
      }

      return {
        success: true,
        data: { firebase: firebaseResult.data, server: serverResult.data },
        message: 'Login successful'
      };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async logout() {
    return await this.firebaseLogout();
  }

  // Core API Methods
  async getDashboard() {
    return this.makeAuthenticatedRequest('GET', `/api/admin/dashboard`);
  }

  // Business Management
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
  async updateRestaurantCredits(id, credits) {
    return this.makeAuthenticatedRequest('POST', `/api/admin/add-credits`, { id, credits });
  }

  async updateBusinessStatus(id, status, queryMessage = null) {
    const payload = { id, status };
    if (status === 'Query' && queryMessage) payload.query_message = queryMessage;
    return this.makeAuthenticatedRequest('POST', '/api/admin/update-business-status', payload);
  }

  async updateBusiness(id, business_name, owner_name, email, mobile_number, city, address, business_type, outlet_type, legal_entity_name, franchise_code, is_active, franchise = []) {
    const payload = { id, business_name, owner_name, email, mobile_number, city, address, business_type, outlet_type, legal_entity_name, franchise_code, is_active, franchise};
    return this.makeAuthenticatedRequest('POST', '/api/admin/update-business', payload);
  }

  async uploadDocumentation(uploadDocData) {
    const formData = this.createUploadDocFormData(uploadDocData);
    return this.makeFormDataRequest('POST', '/api/admin/upload-document', formData);
  }

  createUploadDocFormData(uploadDocData) {
    const formData = new FormData();
    const fields = ['id','type', 'document'];
    fields.forEach(field => formData.append(field, uploadDocData[field]));

    return formData;
  }

  // Outlet Management
  async getOutlets() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/outlets');
  }

  async addOutlet(name) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add-outlet', { name });
  }

  async updateOutlet(id, isActive) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/update-outlet', { id, is_active: isActive });
  }

  // Sub Admin Management
  async addSubAdmin(email, name, role, password, modules, is_active) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add-sub-admin', { email, name, role, password, modules, is_active });
  }

  async deleteSubAdmin(id) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/delete-sub-admin', { id });
  }

  async listSubAdmins() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/list-sub-admin');
  }
  async listModules() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/list-permissions');
  }

  // Pricing Management
  async listPriceSlabs() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/list-price-slabs');
  }

  async updatePriceSlab(id, minQty, maxQty, pricePerUnit) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/update-price-slabs', {
      id, min_qty: minQty, max_qty: maxQty, price_per_unit: pricePerUnit
    });
  }

  async addPriceSlab(minQty, maxQty, pricePerUnit) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add-price-slabs', {
      min_qty: minQty, max_qty: maxQty, price_per_unit: pricePerUnit
    });
  }

  // Product Management
  async getProducts(categoryId = null, name = '') {
    const params = [];
    if (categoryId) params.push(`category_id=${categoryId}`);
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.makeAuthenticatedRequest('GET', `/api/admin/products${query}`);
  }

  async addProduct(productData) {
    const formData = this.createProductFormData(productData);
    return this.makeFormDataRequest('POST', '/api/admin/add-products', formData);
  }

  async updateProduct(productId, productData) {
    const formData = this.createProductFormData(productData);
    formData.append('id', productId);
    return this.makeFormDataRequest('POST', '/api/admin/update-products', formData);
  }

  async updateProductStatus(productId, status) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/update-products-status', {
      id: productId, is_active: status
    });
  }

  // Category Management
  async getCategories(categoryId = null) {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return this.makeAuthenticatedRequest('GET', `/api/admin/categories${query}`);
  }

  async addCategory(categoryData) {
    const formData = this.createCategoryFormData(categoryData);
    return this.makeFormDataRequest('POST', '/api/admin/categories/add', formData);
  }

  async updateCategory(id, name, is_active) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/categories/update', {id, name, is_active});
  }

  // Sub-Category Management
  async getSubCategories(categoryId = null) {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return this.makeAuthenticatedRequest('GET', `/api/admin/sub-categories/list${query}`);
  }
  async addSubCategory(Name) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/sub-categories/add', {name: Name});
  }
  async updateSubCategory(id, name, is_active) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/sub-categories/update', {id, name, is_active});
  }

  // Material Management
  async getMaterials() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/materials');
  }

  async addMaterial(mName) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/materials/add', {name: mName});
  }

  // User Data
  async getUserData() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/get-data');
  }

   // CMS Policy APIs
 async getPolicies() {
    return this.makeAuthenticatedRequest('GET', `/api/admin/cms/list`);
  }

  async createPolicy(policyData) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/cms/add', policyData);
  }

  async updatePolicy(policyId, policyData) {
    return this.makeAuthenticatedRequest('PUT', '/api/admin/cms/update', { id: policyId, ...policyData });
  }

  async deletePolicy(policyId) {
    return this.makeAuthenticatedRequest('DELETE', '/api/admin/cms/delete', { id: policyId });
  }

  //Notification APIs
  async getNotifications() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/notifications');
  }

  async getNotificationCount() {
    return this.makeAuthenticatedRequest('GET', `/api/admin/notifications/count`);
  }

  //Problems APIs
  async getProblems() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/problem');
  }

  async changeProblemStatus(problemId, status) {
    return this.makeAuthenticatedRequest('GET', '/api/admin/problem/status', { id: problemId, status });
  }
  
  //Bot APIs
  async getBotData() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/bot/message-list');
  }

  async updateBotMessages(type, message) {
    return this.makeAuthenticatedRequest('POST', `/api/admin/bot/update-message`, {type, message});
  }

  //Delivery APIs
  async getDeliveries() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/delhivery');
  }
  async addDeliveryLocation(pricing) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/delhivery/add-location', {pricing});
  }
  async updateDeliveryCharges(payload) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/delhivery/update-charge', payload);
  }
  async updateDeliveryStatus(deliveryId, is_active) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/delhivery/change-status', { id: deliveryId, is_active });
  }

  //Delivery Partner APIs
  async getDeliveryPartners() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/list/delivery_partners');
  }
  async addDeliveryPartner(name, tracking_link) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add/delivery_partners', {name, tracking_link});
  }
  
  //Discount Ticket APIs
  async getDiscounts() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/list-discount-ticket-coupon');
  }
  async addDiscountTicket(discount) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add-discount-ticket', discount);
  }
  async updateDiscountTicket(discount) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/update/discount-ticket', discount);
  }
  async addTicketCoupon(coupon) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/add-discount-ticket-coupon', { id: coupon });
  }
  async updateTicketCouponStatus(coupon) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/discount-ticket-coupon/status', coupon);
  }
  async deleteTicketCoupon(couponId) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/delete/coupon', { id: couponId });
  }

  //Order List APIs
  async getOrderList() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/order/list');
  }
  async getCartList() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/order/cart');
  }
  async getAssignDeliveryPartnerList() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/order/assign-delivery-partner');
  }
  async updateDeliveryPartners(updatePayload) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/order/set-delivery-partner', updatePayload);
  }


  // Helper Methods
  createProductFormData(productData) {
    const formData = new FormData();
    const fields = ['name', 'category_id','subcategory_id', 'material_id', 'hsn_code', 'shape', 'colour', 'specs', 'features','quality', 'in_stock'];
    fields.forEach(field => formData.append(field, productData[field]));
    
     // ✅ Handle size array as JSON string
      if (Array.isArray(productData.sizes)) {
        formData.append('sizes', JSON.stringify(productData.sizes));
      } else {
        formData.append('sizes', '[]'); // or '' if you prefer
      }

    if (productData.images?.length > 0) {
      productData.images.forEach(image => {
        if (image.originFileObj) formData.append('document', image.originFileObj);
      });
    }

    // Add discounts and subcategories to form data
    if (Array.isArray(productData.discounts)) {
      formData.append('discounts', JSON.stringify(productData.discounts));
    } else {
      formData.append('discounts', '[]');
    }

    if (Array.isArray(productData.subcategories)) {
      formData.append('subcategories', JSON.stringify(productData.subcategories));
    } else {
      formData.append('subcategories', '[]');
    }
    
    return formData;
  }

  createCategoryFormData(categoryData) {
    const formData = new FormData();
    const fields = ['name', 'is_active'];
    fields.forEach(field => formData.append(field, categoryData[field]));
    
    if (categoryData.images?.length > 0) {
      categoryData.images.forEach(image => {
        if (image.originFileObj) formData.append('image_url', image.originFileObj);
      });
    }
    
    return formData;
  }

  createBannerFormData(bannerData) {
    const formData = new FormData();
    // Remove 'image_url' from the fields array since we handle it separately
    const fields = ['title', 'placement', 'priority', 'is_active'];
    fields.forEach(field => formData.append(field, bannerData[field] || ''));
    
    // Handle image file separately
    if (bannerData.images?.length > 0) {
      bannerData.images.forEach(image => {
        if (image.originFileObj) formData.append('image_url', image.originFileObj);
      });
    }
    
    return formData;
  }

  // Advertisement Management APIs
  async getBanners() {
    return this.makeAuthenticatedRequest('GET', '/api/admin/banners');
  }

  async addBanner(bannerData) {
    const formData = this.createBannerFormData(bannerData);
    return this.makeFormDataRequest('POST', '/api/admin/banners/add', formData);
  }

  async updateBanner(id) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/banners/update', {id});
  }

  async deleteBanner(bannerId) {
    return this.makeAuthenticatedRequest('POST', '/api/admin/banners/delete', {
      id: bannerId
    });
  }

  async makeAuthenticatedRequest(method, endpoint, data = null) {
    try {
      const token = this.getServerAuth();
      if (!token) throw new Error('No authentication token found. Please login again.');

      const config = {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      return this.handleResponse(response, endpoint);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async makeFormDataRequest(method, endpoint, formData) {
    try {
      const token = this.getServerAuth();
      if (!token) throw new Error('No authentication token found. Please login again.');

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      return this.handleResponse(response, endpoint);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async handleResponse(response, endpoint) {
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (response.status === 404) throw new Error(`API endpoint not found: ${endpoint}`);
      if (response.status >= 500) throw new Error(`Server error (${response.status})`);
      throw new Error(`Expected JSON response but got ${contentType || 'unknown type'}`);
    }

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAllAuth();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(responseData.message || responseData.error || `Request failed with status ${response.status}`);
    }

    return { success: true, data: responseData };
  }

  handleError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { success: false, error: `Cannot connect to server at ${this.baseURL}` };
    }
    return { success: false, error: error.message };
  }

  async getCurrentIdToken() {
    try {
      if (!this.currentUser) throw new Error('No user currently signed in');
      const idToken = await getIdToken(this.currentUser, true);
      return { success: true, idToken };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Storage Methods
  setFirebaseAuth(uid, idToken) {
    try {
      localStorage.setItem('firebase_uid', uid);
      localStorage.setItem('firebase_id_token', idToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  getFirebaseAuth() {
    try {
      const uid = localStorage.getItem('firebase_uid');
      const idToken = localStorage.getItem('firebase_id_token');
      return { uid, idToken };
    } catch (error) {
      return { uid: null, idToken: null };
    }
  }

  clearFirebaseAuth() {
    try {
      localStorage.removeItem('firebase_uid');
      localStorage.removeItem('firebase_id_token');
      return true;
    } catch (error) {
      return false;
    }
  }

  setServerAuth(token) {
    try {
      Cookies.set('admin_token', token, { 
        expires: 7,
        secure: this.isProduction(),
        sameSite: 'strict'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  getServerAuth() {
    try {
      return Cookies.get('admin_token') || null;
    } catch (error) {
      return null;
    }
  }

  clearServerAuth() {
    try {
      Cookies.remove('admin_token');
      return true;
    } catch (error) {
      return false;
    }
  }

  clearAllAuth() {
    const firebaseCleared = this.clearFirebaseAuth();
    const serverCleared = this.clearServerAuth();
    this.serverToken = null;
    return firebaseCleared && serverCleared;
  }

  // Status Methods
  isAuthenticated() {
    return !!(this.currentUser && this.getServerAuth());
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getAuthTokens() {
    const firebase = this.getFirebaseAuth();
    const server = this.getServerAuth();
    return {
      firebase,
      server,
      isComplete: !!(firebase.uid && firebase.idToken && server)
    };
  }

  async testConnection() {
    try {
      const response = await fetch(this.baseURL, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        baseURL: this.baseURL
      };
    } catch (error) {
      return { success: false, error: error.message, baseURL: this.baseURL };
    }
  }

  getDebugInfo() {
    const auth = this.getAuthTokens();
    return {
      baseURL: this.baseURL,
      currentUser: this.currentUser ? { uid: this.currentUser.uid, email: this.currentUser.email } : null,
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

  handleFirebaseError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Admin account not found',
      'auth/wrong-password': 'Invalid password',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'Admin account has been disabled',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection'
    };

    const errorMessage = errorMessages[error.code] || error.message || 'Authentication failed';

    return {
      success: false,
      error: errorMessage,
      code: error.code
    };
  }

async getAllowedModules() {
  try {
    console.log('🔍--- AdminService - Fetching allowed modules...');
    
    // Step 1: Validate auth tokens
    const tokens = this.getAuthTokens();
    if (!tokens || !tokens.server) {
      console.error('❌ AdminService - No server token available');
      return {
        success: false,
        error: 'No authentication token available',
        errorCode: 'NO_AUTH_TOKEN'
      };
    }

    // Step 2: Validate current user
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      console.error('❌ AdminService - No current user information available');
      return {
        success: false,
        error: 'No current user information available',
        errorCode: 'NO_USER_INFO'
      };
    }

    // Step 3: Make API call
    console.log('📡 Making API request to /api/admin/list-permissions');
    
    const response = await this.makeAuthenticatedRequest('GET', '/api/admin/list-sub-admin');
    
    // Step 4: Debug - Log the entire response structure
    console.log('🔍 FULL API RESPONSE DEBUG:');
    console.log('Response type:', typeof response);
    console.log('Response keys:', response ? Object.keys(response) : 'No response');
    console.log('Response.success:', response?.success);
    console.log('Response.data type:', typeof response?.data);
    console.log('Response.data:', response?.data);
    
    // Step 5: Basic response validation
    if (!response) {
      console.error('❌ No response received from API');
      return {
        success: false,
        error: 'No response received from server',
        errorCode: 'NO_RESPONSE'
      };
    }

    if (!response.success) {
      console.error('❌ API request failed:', response.error);
      return {
        success: false,
        error: response.error || 'API request failed',
        errorCode: 'API_ERROR'
      };
    }

    if (!response.data) {
      console.error('❌ No data in response');
      return {
        success: false,
        error: 'No data received from server',
        errorCode: 'NO_DATA'
      };
    }

    // Step 6: Handle different possible response structures
    let userData = null;
    let modules = [];

    // Case 1: Direct array of users
    if (Array.isArray(response.data)) {
      console.log('📋 Response data is a direct array of users');
      userData = response.data.find(user => {
        if (!user || typeof user !== 'object') return false;
        const uidMatch = user.uid && currentUser.uid && String(user.uid) === String(currentUser.uid);
        const emailMatch = user.email && currentUser.email && 
                          String(user.email).toLowerCase().trim() === String(currentUser.email).toLowerCase().trim();
        return uidMatch || emailMatch;
      });
    }
    
    // Case 2: Object with users array
      else if (response.data.users && Array.isArray(response.data.users)) {
          console.log('📋 Response data has users array');
          userData = response.data.find(user => {
      if (!user || typeof user !== 'object') return false;
  
      const uidMatch = user.uid && currentUser.uid && String(user.uid) === String(currentUser.uid);
      const emailMatch = user.email && currentUser.email && 
                        String(user.email).toLowerCase().trim() === String(currentUser.email).toLowerCase().trim();
      return uidMatch || emailMatch;
    });
        }
    
    // Case 3: Single user object
    else if (response.data.uid || response.data.email) {
      console.log('📋 Response data is a single user object');
      userData = response.data.find(user => {
    if (!user || typeof user !== 'object') return false;
  
    const uidMatch = user.uid && currentUser.uid && String(user.uid) === String(currentUser.uid);
    const emailMatch = user.email && currentUser.email && 
                      String(user.email).toLowerCase().trim() === String(currentUser.email).toLowerCase().trim();
    return uidMatch || emailMatch;
  });
      }
    
    // Case 4: Direct modules array (if API returns modules directly)
    else if (response.data.modules || Array.isArray(response.data)) {
      console.log('📋 Response data might contain direct modules');
      modules = response.data.modules || response.data;
      
      return {
        success: true,
        data: modules,
        note: 'Modules retrieved directly from response'
      };
    }

    // Case 5: Check for other possible structures
    else {
      console.log('📋 Unknown response structure, exploring...');
      
      // Try to find any array that might contain user data
      const possibleArrays = Object.keys(response.data).filter(key => 
        Array.isArray(response.data[key])
      );
      
      console.log('Found arrays in response:', possibleArrays);
      
      if (possibleArrays.length > 0) {
        for (const arrayKey of possibleArrays) {
          console.log(`Checking array: ${arrayKey}`, response.data[arrayKey]);
          
          const foundUser = response.data[arrayKey].find(item => {
            if (typeof item === 'object' && item !== null) {
              const uidMatch = item.uid && currentUser.uid && item.uid === currentUser.uid;
              const emailMatch = item.email && currentUser.email && 
                                item.email.toLowerCase() === currentUser.email.toLowerCase();
              return uidMatch || emailMatch;
            }
            return false;
          });
          
          if (foundUser) {
            userData = foundUser;
            break;
          }
        }
      }
    }

    // Step 6: Handle different possible response structures
    console.log('🔍 Current user for matching:', {
      uid: currentUser.uid,
      email: currentUser.email,
      uidType: typeof currentUser.uid,
      emailType: typeof currentUser.email
    });

    // Step 7: Handle user data if found
    if (userData) {
      console.log('✅ Found user data:', {
        uid: userData.uid,
        email: userData.email,
        hasModules: !!userData.modules
      });
      
      modules = userData.modules || [];
    } else {
      console.error('❌ Current user not found in response');
      console.log('Current user details:', {
        uid: currentUser.uid,
        email: currentUser.email
      });
      
      return {
        success: false,
        error: 'Current user not found in permissions list',
        errorCode: 'USER_NOT_FOUND',
        debugInfo: {
          responseStructure: Object.keys(response.data),
          currentUser: {
            uid: currentUser.uid,
            email: currentUser.email
          }
        }
      };
    }

    // Step 8: Return modules
    console.log('✅ Modules fetched successfully:', {
      moduleCount: Array.isArray(modules) ? modules.length : 'N/A',
      modules: modules
    });
    
    return {
      success: true,
      data: modules,
      userInfo: userData ? {
        uid: userData.uid,
        email: userData.email
      } : null
    };
    
  } catch (error) {
    console.error('❌ AdminService - Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
      errorCode: 'UNEXPECTED_ERROR'
    };
  }
}

}

export default new AdminService();