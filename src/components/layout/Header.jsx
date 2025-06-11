import React from 'react'
import { Bell, Search, LogOut } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import useAuth from '../../hooks/useAuth'
import useTheme from '../../hooks/useTheme'

export default function Header() {
  const { logout } = useAuth()
  const { isDark } = useTheme()

  return (
    <header className={`h-16 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 flex items-center justify-between shadow-sm transition-colors duration-300`}>
      {/* Search Bar */}
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

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        
        <button className={`p-2 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} rounded-lg transition-all duration-200`}>
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          <button
            onClick={logout}
            className={`p-2 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} rounded-lg transition-all duration-200`}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}