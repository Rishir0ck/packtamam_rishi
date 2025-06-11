import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RestaurantOnboarding from './pages/RestaurantOnboarding'
import RestaurantManagement from './pages/RestaurantManagement'
import InventoryManagement from './pages/InventoryManagement'
import Profile from './pages/Profile'
import LoadingScreen from './components/common/LoadingScreen'
import ResponsiveWarning from './components/common/ResponsiveWarning'
import useAuth from './hooks/useAuth'
import useResponsive from './hooks/useResponsive'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const { isSupported } = useResponsive()

  if (loading) return <LoadingScreen />
  if (!isSupported) return <ResponsiveWarning />

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="restaurant-onboarding" element={<RestaurantOnboarding />} />
        <Route path="restaurant-management" element={<RestaurantManagement />} />
        <Route path="inventory-management" element={<InventoryManagement />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
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
  )
}

export default App