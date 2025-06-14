// src/Firebase/hooks/useAuthGuard.js
import { useState, useEffect, useCallback } from 'react';
import AdminService from '../services/adminApiService';

export const useAuthGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    try {
      const authStatus = AdminService.isAuthenticated();
      const currentUser = AdminService.getCurrentUser();
      
      setIsAuthenticated(authStatus);
      setUser(currentUser);
      
      console.log(`🔍 Auth Guard - Status: ${authStatus ? 'Authenticated' : 'Not Authenticated'}`);
      
      return authStatus;
    } catch (error) {
      console.error('❌ Auth Guard - Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Auth Guard - Initializing...');
      setLoading(true);
      
      try {
        // Check current auth status
        const authStatus = checkAuthStatus();
        
        // If we have tokens but no current user, wait a bit for Firebase auth state
        if (!authStatus) {
          const tokens = AdminService.getAuthTokens();
          if (tokens.firebase.uid && tokens.server) {
            console.log('🔄 Auth Guard - Found tokens, waiting for Firebase auth state...');
            // Wait a bit for Firebase auth state to be restored
            await new Promise(resolve => setTimeout(resolve, 1000));
            checkAuthStatus();
          }
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error('❌ Auth Guard - Initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
        setAuthInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  // Set up periodic auth checks (optional)
  useEffect(() => {
    if (!authInitialized) return;

    const interval = setInterval(() => {
      // Only check if we think we're authenticated
      if (isAuthenticated) {
        const currentStatus = checkAuthStatus();
        // If auth status changed, this will trigger re-render
        if (!currentStatus) {
          console.log('🚫 Auth Guard - Authentication lost during periodic check');
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [authInitialized, isAuthenticated, checkAuthStatus]);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔐 Auth Guard - Starting login process...');
      setLoading(true);

      const result = await AdminService.login(email, password);
      
      if (result.success) {
        // Update auth state immediately
        setIsAuthenticated(true);
        setUser(AdminService.getCurrentUser());
        console.log('✅ Auth Guard - Login successful');
        
        return {
          success: true,
          message: 'Login successful'
        };
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('❌ Auth Guard - Login failed:', result.error);
        
        return {
          success: false,
          error: result.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ Auth Guard - Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    } finally {
      setLoading(false);
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
      
      console.log('✅ Auth Guard - Logout completed');
      
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('❌ Auth Guard - Logout error:', error);
      
      // Clear state even if logout fails
      setIsAuthenticated(false);
      setUser(null);
      
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Get current authentication tokens
  const getAuthTokens = () => {
    return AdminService.getAuthTokens();
  };

  // Check if user has specific permissions (can be extended)
  const hasPermission = (permission) => {
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
        // Re-check auth status after token refresh
        checkAuthStatus();
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

  // Force auth check (useful for manual refresh)
  const forceAuthCheck = () => {
    console.log('🔄 Auth Guard - Force checking authentication...');
    return checkAuthStatus();
  };

  return {
    // State
    isAuthenticated,
    loading,
    user,
    authInitialized,
    
    // Methods
    login,
    logout,
    refreshAuth,
    forceAuthCheck,
    getAuthTokens,
    hasPermission,
    
    // Utility
    debugInfo: AdminService.getDebugInfo()
  };
};