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

  // Default modules to show ONLY if API fails AND no modules are in localStorage
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
      return stored ? JSON.parse(stored) : null; // Return null instead of empty array
    } catch (error) {
      console.error('Error reading modules from localStorage:', error);
      return null;
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
  // const fetchAllowedModules = async () => {
  //   try {
  //     setModulesLoading(true);
  //     console.log('🔍 Fetching allowed modules...');
      
  //     // Check if the getAllowedModules method exists
  //     if (typeof AdminService.getAllowedModules !== 'function') {
  //       console.warn('⚠️ AdminService.getAllowedModules not implemented');
  //       return null; // Return null instead of setting default modules
  //     }
      
  //     const response = await AdminService.getAllowedModules();
      
  //     if (response && response.success && response.data) {
  //       const modules = Array.isArray(response.data) 
  //         ? response.data.map(module => typeof module === 'string' ? module : module.name || module.module_name)
  //         : [];
        
  //       if (modules.length > 0) {
  //         setAllowedModules(modules);
  //         saveModulesToStorage(modules);
  //         console.log('✅ Allowed modules fetched:', modules);
  //         return modules;
  //       } else {
  //         console.warn('⚠️ No modules returned from API');
  //         return null;
  //       }
  //     } else {
  //       console.error('❌ Failed to fetch modules:', response?.error || 'Unknown error');
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('❌ Error fetching modules:', error);
  //     return null;
  //   } finally {
  //     setModulesLoading(false);
  //   }
  // };

  // Fetch allowed modules from API
const fetchAllowedModules = async () => {
  try {
    setModulesLoading(true);
    console.log('🔍 Fetching allowed modules...');
    
    // Check if the getAllowedModules method exists
    if (typeof AdminService.getAllowedModules !== 'function') {
      console.warn('⚠️ AdminService.getAllowedModules not implemented');
      return null; // Return null instead of setting default modules
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
        console.warn('⚠️ No modules returned from API');
        return null;
      }
    } else {
      // Handle specific error case for user not found in permissions
      const errorMessage = response?.error || 'Unknown error';
      if (errorMessage.includes('Current user not found in permissions list')) {
        console.warn('⚠️ User not found in permissions list - using stored or default modules');
        // Don't throw error, just return null to fallback to stored/default modules
        return null;
      } else {
        console.error('❌ Failed to fetch modules:', errorMessage);
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Error fetching modules:', error);
    
    // Handle specific error case for permissions
    if (error.message && error.message.includes('Current user not found in permissions list')) {
      console.warn('⚠️ User not found in permissions list - using stored or default modules');
      return null;
    }
    
    return null;
  } finally {
    setModulesLoading(false);
  }
};

  // Set default modules only when necessary
  const setDefaultModules = () => {
    console.log('⚠️ Using default modules as fallback');
    setAllowedModules(DEFAULT_MODULES);
    saveModulesToStorage(DEFAULT_MODULES);
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

        // Load modules with proper priority
        console.log('🔄 Auth Guard - Loading modules on initialization...');
        
        // First try to get from localStorage
        const storedModules = getStoredModules();
        if (storedModules && storedModules.length > 0) {
          console.log('📦 Auth Guard - Loaded modules from storage:', storedModules);
          setAllowedModules(storedModules);
        }

        // Then try to fetch fresh modules from API (only if authenticated)
        if (authStatus) {
          const apiModules = await fetchAllowedModules();
          // If API call succeeded, apiModules will be set automatically
          // If API call failed, we keep the stored modules (if any)
          
          // Only set default modules if we have no stored modules AND API failed
          if (!apiModules && (!storedModules || storedModules.length === 0)) {
            setDefaultModules();
          }
        } else {
          // Not authenticated - only set default modules if no stored modules exist
          if (!storedModules || storedModules.length === 0) {
            setDefaultModules();
          }
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error('❌ Auth Guard - Initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
        
        // Check if we have stored modules before falling back to default
        const storedModules = getStoredModules();
        if (storedModules && storedModules.length > 0) {
          console.log('📦 Auth Guard - Using stored modules despite initialization error:', storedModules);
          setAllowedModules(storedModules);
        } else {
          setDefaultModules();
        }
        
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
        const apiModules = await fetchAllowedModules();
        
        // Only set default modules if API call failed
        if (!apiModules) {
          const storedModules = getStoredModules();
          if (!storedModules || storedModules.length === 0) {
            setDefaultModules();
          }
        }
        
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

  // Refresh modules manually
  const refreshModules = async () => {
    console.log('🔄 Auth Guard - Manually refreshing modules...');
    const apiModules = await fetchAllowedModules();
    
    // Only set default modules if API call failed AND no stored modules exist
    if (!apiModules) {
      const storedModules = getStoredModules();
      if (!storedModules || storedModules.length === 0) {
        setDefaultModules();
      }
    }
    
    return apiModules;
  };

  // Force set default modules (for testing/debugging)
  const useDefaultModules = () => {
    console.log('🔧 Auth Guard - Using default modules for testing');
    setDefaultModules();
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