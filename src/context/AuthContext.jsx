import React, { createContext, useContext, useMemo } from 'react';
import { useAuthGuard } from '../Firebase/hooks/useAuthGuard';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Use the useAuthGuard hook here, not in the components
  const authData = useAuthGuard();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated: authData.isAuthenticated,
    loading: authData.loading,
    user: authData.user,
    authInitialized: authData.authInitialized,
    login: authData.login,
    logout: authData.logout,
    refreshAuth: authData.refreshAuth,
    forceAuthCheck: authData.forceAuthCheck,
    getAuthTokens: authData.getAuthTokens,
    hasPermission: authData.hasPermission,
    debugInfo: authData.debugInfo
  }), [
    authData.isAuthenticated,
    authData.loading,
    authData.user,
    authData.authInitialized,
    authData.login,
    authData.logout,
    authData.refreshAuth,
    authData.forceAuthCheck,
    authData.getAuthTokens,
    authData.hasPermission,
    authData.debugInfo
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthContext };