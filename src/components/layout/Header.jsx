import React, { useState } from 'react'
import { Bell, ChevronDown, User, LogOut, RotateCcw } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import Notifications from '../common/Notifications'
import { useAuthGuard } from '../../Firebase/hooks/useAuthGuard'
import useTheme from '../../hooks/useTheme'

export default function Header() {
  const { logout, loading, user } = useAuthGuard()
  const { isDark } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
    setShowNotifications(false)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowProfileMenu(false)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setShowProfileMenu(false)
    setShowNotifications(false)
    
    try {
      // Refresh the entire page/system
      window.location.reload()
    } catch (error) {
      console.error('Refresh error:', error)
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setShowProfileMenu(false)
      
      const result = await logout()
      
      if (result.success) {
        window.location.href = '/login'
      } else {
        alert('Logout failed: ' + result.error)
      }
    } catch (error) {
      alert('An error occurred during logout: ' + error.message)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const userInfo = {
    name: user?.displayName || 'Admin User',
    email: user?.email || 'admin@packtamam.com',
    initials: (user?.displayName || user?.email || 'A').charAt(0).toUpperCase()
  }

  const isDisabled = loading || isLoggingOut || isRefreshing

  return (
    <header 
      className={`h-16 ${
        isDark ? 'bg-gray-800 shadow-lg shadow-gray-900/50' : 'bg-white border-[#c79e73]/20'
      } border-b px-6 flex items-center justify-between transition-all duration-300`}
      style={{
        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex-1" />

      <div className="flex items-center space-x-4 relative">
        <ThemeToggle />
        
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isDisabled}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isDark 
              ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
              : 'text-[#43311e] hover:text-[#c79e73] hover:bg-[#c79e73]/10'
          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Refresh"
        >
          <RotateCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            disabled={isDisabled}
            className={`p-2 rounded-lg transition-all duration-200 relative ${
              isDark 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-[#43311e] hover:text-[#c79e73] hover:bg-[#c79e73]/10'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Bell className="w-5 h-5" />
            {/* <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">3</span>
            </span> */}
          </button>
          
          {showNotifications && (
            <Notifications onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={toggleProfileMenu}
            disabled={isDisabled}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-[#43311e] hover:bg-[#c79e73]/10'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{
                background: isDark 
                  ? `linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)`
                  : `linear-gradient(135deg, #c79e73 0%, #43311e 100%)`
              }}
            >
              <span className="text-white text-sm font-semibold">{userInfo.initials}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div 
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#c79e73]/20'
              }`}
              style={{
                boxShadow: isDark 
                  ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-[#c79e73]/20'}`}>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-[#43311e]'}`}>
                  {userInfo.name}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#43311e]/70'}`}>
                  {userInfo.email}
                </p>
              </div>
              
              <div className="py-2">
                {/* <button 
                  disabled={isLoggingOut}
                  className={`w-full px-4 py-2 text-left flex items-center space-x-2 transition-colors duration-200 ${
                    isDark 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-[#43311e] hover:bg-[#c79e73]/10'
                  } ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button> */}
                
                {/* <hr className={`my-2 ${isDark ? 'border-gray-700' : 'border-[#c79e73]/20'}`} /> */}
                
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`w-full px-4 py-2 text-left flex items-center space-x-2 transition-colors duration-200 ${
                    isDark 
                      ? 'text-red-400 hover:bg-red-500/20' 
                      : 'text-red-600 hover:bg-red-50'
                  } ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <LogOut className={`w-4 h-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(showProfileMenu || showNotifications) && !isLoggingOut && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowProfileMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}