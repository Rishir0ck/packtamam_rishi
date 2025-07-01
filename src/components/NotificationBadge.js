// components/NotificationBadge.js
import React from 'react'
import { Bell } from 'lucide-react'
import { useNotificationCount } from '../hooks/useNotificationCount'

export default function NotificationBadge({ onClick, isDark = false }) {
  const { count, loading } = useNotificationCount()
  
  const iconColor = isDark ? 'text-gray-300 hover:text-white' : 'text-[#43311e] hover:text-[#c79e73]'
  const badgeColor = isDark ? 'bg-blue-500' : 'bg-[#c79e73]'

  return (
    <button 
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-colors ${iconColor}`}
      disabled={loading}
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className={`absolute -top-1 -right-1 ${badgeColor} text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium`}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}