import React, { useState } from 'react'
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import Notifications from '../common/Notifications'
import useAuth from '../../hooks/useAuth'
import useTheme from '../../hooks/useTheme'

export default function Header() {
  const { logout } = useAuth()
  const { isDark } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
    setShowNotifications(false)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowProfileMenu(false)
  }

  return (
    <header 
      className={`h-16 ${
        isDark 
          ? 'bg-gray-800 shadow-lg shadow-gray-900/50' 
          : 'bg-white border-[#c79e73]/20'
      } border-b px-6 flex items-center justify-between transition-all duration-300`}
      style={{
        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Search Bar - Commented */}
      {/* 
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
          <input
            type="text"
            placeholder="Search..."
            className={`w-full pl-10 pr-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-300`}
          />
        </div>
      </div>
      */}

      {/* Logo/Title Area */}
      <div className="flex-1">
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#43311e]'}`}>
          Pack Tamam Dashboard
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 relative">
        <ThemeToggle />
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className={`p-2 rounded-lg transition-all duration-200 relative ${
              isDark 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-[#43311e] hover:text-[#c79e73] hover:bg-[#c79e73]/10'
            }`}
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">3</span>
            </span>
          </button>
          
          {showNotifications && (
            <Notifications onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={toggleProfileMenu}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-[#43311e] hover:bg-[#c79e73]/10'
            }`}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{
                background: isDark 
                  ? `linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)`
                  : `linear-gradient(135deg, #c79e73 0%, #43311e 100%)`
              }}
            >
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div 
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-[#c79e73]/20'
              }`}
              style={{
                boxShadow: isDark 
                  ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-[#c79e73]/20'}`}>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-[#43311e]'}`}>Admin User</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#43311e]/70'}`}>admin@packtamam.com</p>
              </div>
              
              <div className="py-2">
                <button className={`w-full px-4 py-2 text-left flex items-center space-x-2 transition-colors duration-200 ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-[#43311e] hover:bg-[#c79e73]/10'
                }`}>
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                
                <button className={`w-full px-4 py-2 text-left flex items-center space-x-2 transition-colors duration-200 ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-[#43311e] hover:bg-[#c79e73]/10'
                }`}>
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                
                <hr className={`my-2 ${isDark ? 'border-gray-700' : 'border-[#c79e73]/20'}`} />
                
                <button 
                  onClick={logout}
                  className={`w-full px-4 py-2 text-left flex items-center space-x-2 transition-colors duration-200 ${
                    isDark 
                      ? 'text-red-400 hover:bg-red-500/20' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showProfileMenu || showNotifications) && (
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