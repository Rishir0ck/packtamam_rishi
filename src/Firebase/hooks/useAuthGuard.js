// src/Firebase/hooks/useAuthGuard.js
import { useState, useEffect, useCallback } from 'react';
import AdminService from '../services/adminApiService';

export const useAuthGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [allowedModules, setAllowedModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  // Default modules to show if API fails or no modules are returned
  const DEFAULT_MODULES = [
    'dashboard',
    'restaurant', 
    'inventory',
    'order_list',
    'chat',
    'profile',
    'policy'
  ];

  // Get allowed modules from localStorage
  const getStoredModules = () => {
    try {
      const stored = localStorage.getItem('allowedModules');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading modules from localStorage:', error);
      return [];
    }
  };

  // Save allowed modules to localStorage
  const saveModulesToStorage = (modules) => {
    try {
      localStorage.setItem('allowedModules', JSON.stringify(modules));
    } catch (error) {
      console.error('Error saving modules to localStorage:', error);
    }
  };

  // Fetch allowed modules from API
  const fetchAllowedModules = async () => {
    try {
      setModulesLoading(true);
      console.log('🔍 Fetching allowed modules...');
      
      // Check if the getAllowedModules method exists
      if (typeof AdminService.getAllowedModules !== 'function') {
        console.warn('⚠️ AdminService.getAllowedModules not implemented, using default modules');
        setAllowedModules(DEFAULT_MODULES);
        saveModulesToStorage(DEFAULT_MODULES);
        return DEFAULT_MODULES;
      }
      
      const response = await AdminService.getAllowedModules();
      
      if (response && response.success && response.data) {
        const modules = Array.isArray(response.data) 
          ? response.data.map(module => typeof module === 'string' ? module : module.name || module.module_name)
          : [];
        
        if (modules.length > 0) {
          setAllowedModules(modules);
          saveModulesToStorage(modules);
          console.log('✅ Allowed modules fetched:', modules);
          return modules;
        } else {
          console.warn('⚠️ No modules returned from API, using default modules');
          setAllowedModules(DEFAULT_MODULES);
          saveModulesToStorage(DEFAULT_MODULES);
          return DEFAULT_MODULES;
        }
      } else {
        console.error('❌ Failed to fetch modules:', response?.error || 'Unknown error');
        console.warn('⚠️ Using default modules due to API failure');
        setAllowedModules(DEFAULT_MODULES);
        saveModulesToStorage(DEFAULT_MODULES);
        return DEFAULT_MODULES;
      }
    } catch (error) {
      console.error('❌ Error fetching modules:', error);
      console.warn('⚠️ Using default modules due to error');
      setAllowedModules(DEFAULT_MODULES);
      saveModulesToStorage(DEFAULT_MODULES);
      return DEFAULT_MODULES;
    } finally {
      setModulesLoading(false);
    }
  };

  // Check if user has access to specific module
  const hasModuleAccess = useCallback((moduleName) => {
    const hasAccess = allowedModules.includes(moduleName);
    console.log(`🔍 Checking module access for "${moduleName}":`, hasAccess, 'Available modules:', allowedModules);
    return hasAccess;
  }, [allowedModules]);

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

        // Always try to load modules on initialization
        console.log('🔄 Auth Guard - Loading modules on initialization...');
        
        // First try to get from localStorage
        const storedModules = getStoredModules();
        if (storedModules.length > 0) {
          console.log('📦 Auth Guard - Loaded modules from storage:', storedModules);
          setAllowedModules(storedModules);
        }

        // Then fetch fresh modules from API (if authenticated or as fallback)
        if (authStatus || storedModules.length === 0) {
          await fetchAllowedModules();
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error('❌ Auth Guard - Initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
        
        // Even on error, provide default modules
        console.warn('⚠️ Using default modules due to initialization error');
        setAllowedModules(DEFAULT_MODULES);
        saveModulesToStorage(DEFAULT_MODULES);
        
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
        
        // Fetch allowed modules after successful login
        await fetchAllowedModules();
        
        console.log('✅ Auth Guard - Login successful');
        
        return {
          success: true,
          message: 'Login successful'
        };
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setAllowedModules([]);
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
      setAllowedModules([]);
      
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
      setAllowedModules([]);
      
      // Clear localStorage
      localStorage.removeItem('allowedModules');
      
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
      setAllowedModules([]);
      localStorage.removeItem('allowedModules');
      
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
        setAllowedModules([]);
        return { success: false, error: tokenResult.error };
      }
    } catch (error) {
      console.error('❌ Auth Guard - Refresh error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setAllowedModules([]);
      return { success: false, error: error.message };
    }
  };

  // Force auth check (useful for manual refresh)
  const forceAuthCheck = () => {
    console.log('🔄 Auth Guard - Force checking authentication...');
    return checkAuthStatus();
  };

  // Refresh modules manually
  const refreshModules = async () => {
    console.log('🔄 Auth Guard - Manually refreshing modules...');
    return await fetchAllowedModules();
  };

  // Force set default modules (for testing/debugging)
  const useDefaultModules = () => {
    console.log('🔧 Auth Guard - Using default modules for testing');
    setAllowedModules(DEFAULT_MODULES);
    saveModulesToStorage(DEFAULT_MODULES);
  };

  return {
    // State
    isAuthenticated,
    loading,
    user,
    authInitialized,
    allowedModules,
    modulesLoading,
    
    // Methods
    login,
    logout,
    refreshAuth,
    forceAuthCheck,
    getAuthTokens,
    hasPermission,
    hasModuleAccess,
    refreshModules,
    useDefaultModules,
    
    // Utility
    debugInfo: AdminService.getDebugInfo ? AdminService.getDebugInfo() : null
  };
};