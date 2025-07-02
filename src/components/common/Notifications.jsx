import React, { useState, useEffect, useRef } from 'react'
import { X, Bell, CheckCircle, AlertTriangle, Info, Clock, Loader2 } from 'lucide-react'
import useTheme from '../../hooks/useTheme'
import adminApiService from '../../Firebase/services/adminApiService'

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  default: <Bell className="w-4 h-4 text-gray-500" />
}

export default function Notifications({ onClose, onCountUpdate }) {
  const { isDark } = useTheme()
  const [notifications, setNotifications] = useState([]) // Ensure it's always an array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (fetchedRef.current) return
      fetchedRef.current = true

      try {
        setLoading(true)
        setError(null)
        
        const [notificationsResponse, countResponse] = await Promise.all([
          adminApiService.getNotifications(),
          adminApiService.getNotificationCount()
        ])
        
        // Process notifications - ensure we always get an array
        let notificationArray = Array.isArray(notificationsResponse) ? notificationsResponse :
                               notificationsResponse?.notifications || notificationsResponse?.data.data || 
                               (notificationsResponse ? [notificationsResponse] : [])
        
        // Additional safety check to ensure it's an array
        if (!Array.isArray(notificationArray)) {
          notificationArray = []
        }
        
        // Process count
        const count = typeof countResponse === 'number' ? countResponse :
                     countResponse?.count || countResponse?.total || countResponse?.data || 0
        
        setNotifications(notificationArray)
        onCountUpdate?.(count) // Update parent component with count
        
      } catch (err) {
        console.error('Notification fetch error:', err)
        setError('Failed to load notifications')
        setNotifications([]) // Ensure notifications is still an array on error
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [onCountUpdate])

  // Add safety check for the filter operation
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => n && n.read).length : 0
  
  const dark = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-[#c79e73]/20 text-[#43311e]'
  const hover = isDark ? 'hover:bg-gray-700' : 'hover:bg-[#c79e73]/5'
  const border = isDark ? 'border-gray-700' : 'border-[#c79e73]/20'
  const muted = isDark ? 'text-gray-400' : 'text-[#43311e]/70'
  const accent = isDark ? 'text-blue-500' : 'text-[#c79e73]'
  const unreadBg = isDark ? 'bg-gray-700/50' : 'bg-[#c79e73]/5'
  const badgeColor = isDark ? 'bg-blue-500 text-white' : 'bg-[#c79e73] text-white'
  const dotColor = isDark ? 'bg-blue-500' : 'bg-[#c79e73]'

  if (loading) return (
    <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${dark} flex items-center justify-center p-8`}>
      <Loader2 className={`w-6 h-6 animate-spin ${accent}`} />
      <span className={`ml-2 text-sm ${muted}`}>Loading...</span>
    </div>
  )

  if (error) return (
    <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${dark} p-4 text-center`}>
      <p className="text-sm text-red-500">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-2 text-xs text-blue-500 hover:underline">
        Retry
      </button>
    </div>
  )

  return (
    <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden ${dark}`}>
      <div className={`flex items-center justify-between p-4 border-b ${border}`}>
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>{unreadCount}</span>
          )}
        </div>
        <button onClick={onClose} className={`p-1 rounded-full transition-colors ${muted} ${hover}`}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {!notifications.length ? (
          <div className="p-8 text-center">
            <Bell className={`w-8 h-8 mx-auto mb-2 ${muted}`} />
            <p className={`text-sm ${muted}`}>No notifications</p>
          </div>
        ) : (
          notifications.map((notification, index) => {
            if (!notification) return null
            
            const { 
              id = `notification-${index}`, 
              type = 'default', 
              title = 'Notification', 
              message = 'No message', 
              read = true, 
              time, 
              created_at,
              timestamp
            } = notification

            const displayTime = time || created_at || timestamp || 'Unknown time'

            return (
              <div key={id} className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors ${border} ${hover} ${!read ? unreadBg : ''}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{icons[type] || icons.default}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{title}</p>
                      {!read && <div className={`w-2 h-2 rounded-full ml-2 ${dotColor}`} />}
                    </div>
                    <p className={`text-sm mt-1 ${muted}`}>{message}</p>
                    <div className="flex items-center mt-2">
                      <Clock className={`w-3 h-3 mr-1 ${muted}`} />
                      <span className={`text-xs ${muted}`}>{displayTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div className={`p-3 border-t ${border}`}>
          <button className={`w-full text-center text-sm font-medium transition-colors ${muted} hover:${accent}`}>
            View All ({notifications.length})
          </button>
        </div>
      )}
    </div>
  )
}