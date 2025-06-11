import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Users, Building2, Package, User } from 'lucide-react'
import useTheme from '../../hooks/useTheme'

const menuItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/restaurant-onboarding', icon: Building2, label: 'Restaurant Onboarding' },
  { path: '/restaurant-management', icon: Users, label: 'Restaurant Management' },
  { path: '/inventory-management', icon: Package, label: 'Inventory Management' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { isDark } = useTheme()

  return (
    <div className={`w-64 h-screen ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-lg transition-colors duration-300`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">PT</span>
          </div>
          <div>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Pack Tamam</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}