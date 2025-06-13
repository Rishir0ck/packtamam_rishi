// src/Firebase/hooks/useAuthGuard.js
import { useState, useEffect } from 'react';
import AdminService from '../services/adminApiService';

export const useAuthGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status on mount and when auth state changes
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authStatus = AdminService.isAuthenticated();
        const currentUser = AdminService.getCurrentUser();
        
        setIsAuthenticated(authStatus);
        setUser(currentUser);
        setLoading(false);
        
        console.log(`🔍 Auth Guard - Status: ${authStatus ? 'Authenticated' : 'Not Authenticated'}`);
      } catch (error) {
        console.error('❌ Auth Guard - Error checking auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    // Initial check
    checkAuthStatus();

    // Set up periodic checks (optional - can be removed if not needed)
    const interval = setInterval(checkAuthStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔐 Auth Guard - Starting login process...');
      setLoading(true);

      const result = await AdminService.login(email, password);
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(AdminService.getCurrentUser());
        console.log('✅ Auth Guard - Login successful');
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('❌ Auth Guard - Login failed:', result.error);
      }

      setLoading(false);
      return result;
    } catch (error) {
      console.error('❌ Auth Guard - Login error:', error);
      setLoading(false);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Auth Guard - Starting logout process...');
      setLoading(true);

      const result = await AdminService.logout();
      
      // Clear state regardless of logout result
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      
      console.log('✅ Auth Guard - Logout completed');
      return result;
    } catch (error) {
      console.error('❌ Auth Guard - Logout error:', error);
      
      // Clear state even if logout fails
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    }
  };

  // Get current authentication tokens
  const getAuthTokens = () => {
    return AdminService.getAuthTokens();
  };

  // Check if user has specific permissions (can be extended)
  const hasPermission = (permission) => {
    // Add your permission logic here
    // For now, just return true if authenticated
    console.log(`🔍 Auth Guard - Checking permission: ${permission}`);
    return isAuthenticated;
  };

  // Refresh authentication (useful for token refresh)
  const refreshAuth = async () => {
    try {
      console.log('🔄 Auth Guard - Refreshing authentication...');
      
      const tokenResult = await AdminService.getCurrentIdToken();
      
      if (tokenResult.success) {
        console.log('✅ Auth Guard - Token refresh successful');
        return { success: true };
      } else {
        console.log('❌ Auth Guard - Token refresh failed');
        setIsAuthenticated(false);
        setUser(null);
        return { success: false, error: tokenResult.error };
      }
    } catch (error) {
      console.error('❌ Auth Guard - Refresh error:', error);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, error: error.message };
    }
  };

  return {
    // State
    isAuthenticated,
    loading,
    user,
    
    // Methods
    login,
    logout,
    refreshAuth,
    getAuthTokens,
    hasPermission,
    
    // Utility
    debugInfo: AdminService.getDebugInfo()
  };
};