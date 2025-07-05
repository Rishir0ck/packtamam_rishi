import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuthGuard } from '../Firebase/hooks/useAuthGuard';
    import { useAuth } from '../context/AuthContext'; // Use AuthContext instead of useAuthGuard

    const ProtectedRoute = ({ 
    children, 
    requiredModule = null, 
    fallbackPath = '/dashboard',
    showUnauthorized = false 
    }) => {
    const { isAuthenticated, hasModuleAccess, loading, authInitialized } = useAuthGuard();
    // const { isAuthenticated, hasModuleAccess, loading, authInitialized } = useAuth();
    const location = useLocation();

    // Show loading while auth is being checked
    if (loading || !authInitialized) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#c79e73] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
            </div>
        </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check module access if required
    if (requiredModule && !hasModuleAccess(requiredModule)) {
        if (showUnauthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-4">You don't have permission to access this module.</p>
                <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-[#c79e73] text-white rounded-lg hover:bg-[#b8865f] transition-colors"
                >
                Go Back
                </button>
            </div>
            </div>
        );
        }

        // Redirect to fallback path if no module access
        return <Navigate to={fallbackPath} replace />;
    }

    // Render children if all checks pass
    return children;
    };

    export default ProtectedRoute;