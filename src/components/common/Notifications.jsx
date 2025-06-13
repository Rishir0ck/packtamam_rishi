import React from 'react'
import { X, Bell, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react'
import useTheme from '../../hooks/useTheme'

const mockNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'New Restaurant Onboarded',
    message: 'Spice Garden has successfully completed onboarding',
    time: '2 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: 'Low Inventory Alert',
    message: 'Tomatoes are running low at Mumbai Kitchen',
    time: '15 minutes ago',
    read: false
  },
  {
    id: 3,
    type: 'info',
    title: 'System Update',
    message: 'Dashboard maintenance scheduled for tonight',
    time: '1 hour ago',
    read: true
  },
  {
    id: 4,
    type: 'success',
    title: 'Order Completed',
    message: 'Order #12345 has been successfully delivered',
    time: '2 hours ago',
    read: true
  },
  {
    id: 5,
    type: 'warning',
    title: 'Payment Due',
    message: 'Monthly subscription payment is due in 3 days',
    time: '1 day ago',
    read: true
  }
]

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    case 'info':
      return <Info className="w-4 h-4 text-blue-500" />
    default:
      return <Bell className="w-4 h-4 text-gray-500" />
  }
}

export default function Notifications({ onClose }) {
  const { isDark } = useTheme()

  return (
    <div 
      className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden ${
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
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-[#c79e73]/20'
      }`}>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-[#43311e]'}`}>
          Notifications
        </h3>
        <button
          onClick={onClose}
          className={`p-1 rounded-full transition-colors duration-200 ${
            isDark 
              ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
              : 'text-[#43311e] hover:bg-[#c79e73]/10'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b last:border-b-0 transition-colors duration-200 cursor-pointer ${
              isDark ? 'border-gray-700' : 'border-[#c79e73]/10'
            } ${
              isDark 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-[#c79e73]/5'
            } ${
              !notification.read 
                ? isDark 
                  ? 'bg-gray-700/50' 
                  : 'bg-[#c79e73]/5'
                : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium truncate ${
                    isDark ? 'text-white' : 'text-[#43311e]'
                  }`}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${
                      isDark ? 'bg-blue-500' : 'bg-[#c79e73]'
                    }`} />
                  )}
                </div>
                
                <p className={`text-sm mt-1 ${
                  isDark ? 'text-gray-300' : 'text-[#43311e]/70'
                }`}>
                  {notification.message}
                </p>
                
                <div className="flex items-center mt-2">
                  <Clock className={`w-3 h-3 mr-1 ${
                    isDark ? 'text-gray-500' : 'text-[#43311e]/50'
                  }`} />
                  <span className={`text-xs ${
                    isDark ? 'text-gray-500' : 'text-[#43311e]/50'
                  }`}>
                    {notification.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-[#c79e73]/20'}`}>
        <button className={`w-full text-center text-sm font-medium transition-colors duration-200 ${
          isDark 
            ? 'text-gray-300 hover:text-white' 
            : 'text-[#43311e] hover:text-[#c79e73]'
        }`}>
          View All Notifications
        </button>
      </div>
    </div>
  )
}