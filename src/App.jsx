import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import AddToCart from './pages/AddToCart'
import Dashboard from './pages/Dashboard'
import RestaurantOnboarding from './pages/RestaurantOnboarding'
import RestaurantManagement from './pages/RestaurantManagement'
import OutletManagement from './pages/OutletManagement'
import InventoryManagement from './pages/InventoryManagement'
import Product from './pages/Product'
import Discount from './pages/Discount'
import Advertisement from './pages/Advertisement'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Policy from './pages/Policy'
import DeliveryPartner from './pages/DeliveryPartner'
import DeliveryCharges from './pages/DeliveryCharges'
import LoadingScreen from './components/common/LoadingScreen'
import ResponsiveWarning from './components/common/ResponsiveWarning'
import useResponsive from './hooks/useResponsive'

import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  // Use the auth context instead of calling useAuthGuard directly
  const { isAuthenticated, loading, authInitialized } = useAuth();
  const { isSupported } = useResponsive();

  // Show loading while auth is initializing
  if (loading || !authInitialized) return <LoadingScreen />;
  if (!isSupported) return <ResponsiveWarning />;

  return (
    //#region   comment Old Code
    // <Routes>
    //   <Route
    //     path="/login"
    //     element={
    //       !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
    //     }
    //   />
    //   <Route
    //     path="/"
    //     element={
    //       isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
    //     }
    //   >
    //     <Route index element={<Navigate to="/dashboard" replace />} />
    //     <Route path="dashboard" element={<Dashboard />} />
    //     <Route
    //       path="restaurant-onboarding"
    //       element={<RestaurantOnboarding />}
    //     />
    //     <Route
    //       path="restaurant-management"
    //       element={<RestaurantManagement />}
    //     />
    //     <Route path="outlet-type" element={<OutletManagement />} />
    //     <Route path="inventory-management" element={<InventoryManagement />} />
    //     <Route path="product" element={<Product />} />
    //     <Route path="discount" element={<Discount />} />
    //     <Route path="advertisement" element={<Advertisement />} />
    //     <Route path="delivery-partner" element={<DeliveryPartner />} />
    //     <Route path="delivery-charges" element={<DeliveryCharges />} />
    //     <Route path="order-list" element={<AddToCart />} />
    //     <Route path="chat" element={<Chat />} />
    //     <Route path="profile" element={<Profile />} />
    //     <Route path="policy" element={<Policy />} />
    //   </Route>
    //   {/* Catch all route - redirect to dashboard if authenticated, login if not */}
    //   <Route
    //     path="*"
    //     element={
    //       <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
    //     }
    //   />
    // </Routes>
    //#endregion
     <div>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              // !isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
            }
          />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard - requires 'dashboard' module */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requiredModule="dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Restaurant routes - require 'restaurant' module */}
            <Route
              path="restaurant-onboarding"
              element={
                <ProtectedRoute requiredModule="restaurant">
                  <RestaurantOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="restaurant-management"
              element={
                <ProtectedRoute requiredModule="restaurant">
                  <RestaurantManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="outlet-type"
              element={
                <ProtectedRoute requiredModule="restaurant">
                  <OutletManagement />
                </ProtectedRoute>
              }
            />

            {/* Inventory routes - require 'inventory' module */}
            <Route
              path="inventory-management"
              element={
                <ProtectedRoute requiredModule="inventory">
                  <InventoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="product"
              element={
                <ProtectedRoute requiredModule="inventory">
                  <Product />
                </ProtectedRoute>
              }
            />
            <Route
              path="discount"
              element={
                <ProtectedRoute requiredModule="inventory">
                  <Discount />
                </ProtectedRoute>
              }
            />
            <Route
              path="advertisement"
              element={
                <ProtectedRoute requiredModule="inventory">
                  <Advertisement />
                </ProtectedRoute>
              }
            />

            {/* Order routes - require 'orders' module */}
            <Route
              path="order-list"
              element={
                <ProtectedRoute requiredModule="order_list">
                  <AddToCart />
                </ProtectedRoute>
              }
            />
            <Route
              path="delivery-partner"
              element={
                <ProtectedRoute requiredModule="order_list">
                  <DeliveryPartner />
                </ProtectedRoute>
              }
            />
            <Route
              path="delivery-charges"
              element={
                <ProtectedRoute requiredModule="order_list">
                  <DeliveryCharges />
                </ProtectedRoute>
              }
            />

            {/* Chat routes - require 'chat' module */}
            <Route
              path="chat"
              element={
                <ProtectedRoute requiredModule="chat">
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Profile routes - require 'profile' module */}
            <Route
              path="profile"
              element={
                <ProtectedRoute requiredModule="profile">
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Policy routes - require 'policy' module */}
            <Route
              path="policy"
              element={
                <ProtectedRoute requiredModule="policy">
                  <Policy />
                </ProtectedRoute>
              }
            />

            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Catch all route - redirect to dashboard if authenticated, login if not */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />     
              // isAuthenticated ? (
              //   <Navigate to="/dashboard" replace />
              // ) : (
              //   <Navigate to="/login" replace />
              // )
            }
          />
        </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;