import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Users, Building2, Package, User, ChevronDown, ChevronRight, ShoppingCart } from 'lucide-react'
import useTheme from '../../hooks/useTheme'
import logoImage from '../../assets/pack tamam.png'

const menuItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { 
    path: '/restaurant', 
    icon: Building2, 
    label: 'Restaurant',
    hasSubmenu: true,
    submenu: [
      { path: '/restaurant-onboarding', label: 'Onboarding' },
      { path: '/restaurant-management', label: 'Management' },
      { path: '/outlet-type', label: 'Outlet' }
    ]
  },
  { path: '/inventory-management', icon: Package, label: 'Inventory' },
  { path: '/order-list', icon: ShoppingCart, label: 'Order List' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { isDark } = useTheme()
  const location = useLocation()
  const [openSubmenus, setOpenSubmenus] = useState({})

  const toggleSubmenu = (path) => {
    setOpenSubmenus(prev => ({ ...prev, [path]: !prev[path] }))
  }

  const isSubmenuItemActive = (submenuItems) => {
    return submenuItems.some(item => location.pathname === item.path)
  }

  const getItemClasses = (isActive) => 
    `flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
      isActive
        ? 'bg-[#c79e73] text-white shadow-sm'
        : isDark
        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  const getIconClasses = (isActive) => 
    `p-1.5 rounded-md ${
      isActive 
        ? 'bg-white/20' 
        : isDark 
        ? 'bg-gray-700 group-hover:bg-gray-600' 
        : 'bg-gray-200 group-hover:bg-gray-300'
    }`

  return (
    <div className={`w-64 h-full flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
      {/* Logo Section */}
      <div className={`p-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200 p-2">
            <img src={logoImage} alt="Pack Tamam Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Pack Tamam</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.path)}
                    className={`w-full justify-between group ${getItemClasses(isSubmenuItemActive(item.submenu))}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={getIconClasses(isSubmenuItemActive(item.submenu))}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {openSubmenus[item.path] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {openSubmenus[item.path] && (
                    <ul className="mt-2 ml-4 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <NavLink to={subItem.path} className={({ isActive }) => getItemClasses(isActive)}>
                            <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
                            <span>{subItem.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink to={item.path} className={({ isActive }) => `${getItemClasses(isActive)} group`}>
                  {({ isActive }) => (
                    <>
                      <div className={getIconClasses(isActive)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="w-10 h-10 bg-[#c79e73] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>Admin User</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>admin@packtamam.com</p>
          </div>
        </div>
      </div>

      {/* Brand accent */}
      <div className="h-1 bg-[#c79e73]"></div>
    </div>
  )
}