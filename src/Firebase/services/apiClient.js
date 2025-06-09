// src/services/apiClient.js
import axios from 'axios';
import { getServerAuth, clearAllAuth } from '../utils/storage';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://167.71.228.10:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = getServerAuth();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Authorization header added to request");
    } else {
      console.log("⚠️ No auth token available for request");
    }
    
    return config;
  },
  (error) => {
    console.error("❌ API Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { config, response } = error;
    
    console.log(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`);
    
    if (response) {
      console.log(`  Status: ${response.status}`);
      console.log(`  Message: ${response.data?.message || 'No message'}`);
    } else {
      console.log("  Network Error: No response received");
    }

    // Handle 401 Unauthorized errors
    if (response && response.status === 401) {
      console.log("🚨 401 Unauthorized - Clearing auth and redirecting to login");
      
      // Clear all auth data
      clearAllAuth();
      
      // Redirect to login (you can customize this based on your routing)
      window.location.href = '/admin/login';
      
      return Promise.reject({
        ...error,
        message: 'Session expired. Please login again.'
      });
    }

    // Handle network errors
    if (!response) {
      console.log("🌐 Network error detected");
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection.'
      });
    }

    // Handle other server errors
    if (response.status >= 500) {
      console.log("🖥️ Server error detected");
      return Promise.reject({
        ...error,
        message: response.data?.message || 'Server error. Please try again later.'
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;