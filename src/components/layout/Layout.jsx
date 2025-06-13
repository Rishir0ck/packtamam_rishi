import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import useTheme from '../../hooks/useTheme'

export default function Layout() {
  const { isDark } = useTheme()

  return (
    <div className={`h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 overflow-hidden`}>
      <div className="flex h-full">
        {/* Fixed Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}