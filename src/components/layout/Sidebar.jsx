import React, { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Users, Building2, Package, User, ChevronDown, ChevronRight, ShoppingCart, Shield, BotIcon } from 'lucide-react'
import useTheme from '../../hooks/useTheme'
import { useAuthGuard } from '../../Firebase/hooks/useAuthGuard'
import logoImage from '../../assets/pack tamam.png'

// Define all menu items with their module requirements
const allMenuItems = [
  { 
    path: '/dashboard', 
    icon: Home, 
    label: 'Dashboard',
    module: 'dashboard'
  },
  { 
    path: '/restaurant', 
    icon: Building2, 
    label: 'Restaurant',
    module: 'restaurant',
    hasSubmenu: true,
    submenu: [
      { path: '/restaurant-onboarding', label: 'Onboarding', module: 'restaurant' },
      { path: '/restaurant-management', label: 'Management', module: 'restaurant' },
      { path: '/outlet-type', label: 'Outlet', module: 'restaurant' }
    ]
  },
  { 
    path: '/inventory', 
    icon: Package, 
    label: 'Inventory',
    module: 'inventory',
    hasSubmenu: true,
    submenu: [
      { path: '/inventory-management', label: 'Management', module: 'inventory' },
      { path: '/advertisement', label: 'Banner', module: 'inventory' }
    ]
  },
  { 
    path: '/order-list', 
    icon: ShoppingCart, 
    label: 'Order List',
    module: 'order_list',
    hasSubmenu: true,
    submenu: [
      { path: '/order-list', icon: Users, label: 'Orders', module: 'order_list' },
      { path: '/delivery-partner', icon: Users, label: 'Delivery Partner', module: 'order_list' },
      { path: '/delivery-charges', icon: Users, label: 'Delivery Charges', module: 'order_list' }
    ]
  },
  { 
    path: '/chat', 
    icon: BotIcon, 
    label: 'Bot Chat',
    module: 'chat'
  },
  { 
    path: '/profile', 
    icon: User, 
    label: 'Profile',
    module: 'profile'
  },
  { 
    path: '/policy', 
    icon: Shield, 
    label: 'CMS',
    module: 'policy'
  },
]

export default function Sidebar() {
  const { isDark } = useTheme()
  const location = useLocation()
  const { hasModuleAccess, allowedModules, modulesLoading } = useAuthGuard()
  const [openSubmenus, setOpenSubmenus] = useState({})

  // Debug logging - Remove in production
  console.log('Sidebar Debug:', {
    modulesLoading,
    allowedModules,
    hasModuleAccess: typeof hasModuleAccess
  })

  // Filter menu items based on allowed modules
  const filteredMenuItems = useMemo(() => {
    // If still loading, return empty array
    if (modulesLoading) {
      return []
    }

    // If no modules are available, show all items (fallback)
    if (!allowedModules || allowedModules.length === 0) {
      console.warn('No allowed modules found, showing all items as fallback')
      return allMenuItems
    }

    // If hasModuleAccess is not a function, show all items (fallback)
    if (typeof hasModuleAccess !== 'function') {
      console.warn('hasModuleAccess is not a function, showing all items as fallback')
      return allMenuItems
    }

    return allMenuItems.filter(item => {
      // Check if main item has access
      const hasMainAccess = hasModuleAccess(item.module)
      
      console.log(`Checking access for ${item.label} (${item.module}):`, hasMainAccess)
      
      if (!hasMainAccess) {
        return false
      }

      // If item has submenu, filter submenu items
      if (item.hasSubmenu && item.submenu) {
        const filteredSubmenu = item.submenu.filter(subItem => {
          const hasSubAccess = hasModuleAccess(subItem.module)
          console.log(`  Checking submenu access for ${subItem.label} (${subItem.module}):`, hasSubAccess)
          return hasSubAccess
        })
        
        // Only show main item if it has at least one accessible submenu item
        if (filteredSubmenu.length === 0) {
          console.log(`  No accessible submenu items for ${item.label}`)
          return false
        }
        
        // Update the item with filtered submenu
        item.submenu = filteredSubmenu
      }

      return true
    })
  }, [allowedModules, hasModuleAccess, modulesLoading])

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
        {modulesLoading ? (
          // Loading state
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 border-2 border-[#c79e73] border-t-transparent rounded-full animate-spin"></div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading menu...
              </span>
            </div>
          </div>
        ) : filteredMenuItems.length === 0 ? (
          // No modules available - Show error state with more info
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No modules available
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Check your permissions
              </div>
              {process.env.NODE_ENV === 'development' && (
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  allowedModules: {JSON.stringify(allowedModules)}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Render filtered menu items
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => (
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
        )}
      </nav>

      {/* Brand accent */}
      <div className="h-1 bg-[#c79e73]"></div>
    </div>
  )
}