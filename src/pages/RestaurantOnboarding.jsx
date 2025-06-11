import React from 'react'
import useTheme from '../hooks/useTheme'

export default function RestaurantOnboarding() {
  const { isDark } = useTheme()

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <h1 className={`text-6xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
          Restaurant Onboarding
        </h1>
        <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          This page will be customized later
        </p>
      </div>
    </div>
  )
}