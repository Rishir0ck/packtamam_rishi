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

export default function Notifications({ onClose }) {
  const { isDark } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [totalCount, setTotalCount] = useState(0)
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
        
        console.log('Fetching notifications and count...') // Debug log
        
        // Fetch both notifications and count in parallel
        const [notificationsResponse, countResponse] = await Promise.all([
          adminApiService.getNotifications(),
          adminApiService.getNotificationCount()
        ])
        
        console.log('Notifications API response:', notificationsResponse) // Debug log
        console.log('Count API response:', countResponse) // Debug log
        
        let notificationArray = []
        
        // Handle different response structures for notifications
        if (Array.isArray(notificationsResponse)) {
          notificationArray = notificationsResponse
        } else if (notificationsResponse && Array.isArray(notificationsResponse.notifications)) {
          notificationArray = notificationsResponse.notifications
        } else if (notificationsResponse && Array.isArray(notificationsResponse.data)) {
          notificationArray = notificationsResponse.data
        } else if (notificationsResponse && typeof notificationsResponse === 'object') {
          // Handle case where data might be a single notification object
          notificationArray = [notificationsResponse]
        }
        
        console.log('Processed notifications:', notificationArray) // Debug log
        console.log('Total count from API:', countResponse) // Debug log
        
        setNotifications(notificationArray)
        
        // Handle count response - it might be a number or an object with count property
        let count = 0
        if (typeof countResponse === 'number') {
          count = countResponse
        } else if (countResponse && typeof countResponse.count === 'number') {
          count = countResponse.count
        } else if (countResponse && typeof countResponse.total === 'number') {
          count = countResponse.total
        } else if (countResponse && typeof countResponse.data === 'number') {
          count = countResponse.data
        }
        
        setTotalCount(count)
        console.log('Final count set:', count) // Debug log
        
      } catch (err) {
        console.error('Notification fetch error:', err)
        setError('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // Debug: Log current state
  console.log('Current state:', { loading, error, notifications, count: notifications.length, totalCount })

  const unreadCount = notifications.filter(n => n && !n.read).length
  // Use totalCount from API or fallback to array length
  const displayCount = totalCount > 0 ? totalCount : notifications.length
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
      <button 
        onClick={() => {
          setError(null)
          setTotalCount(0)
          fetchedRef.current = false
          window.location.reload() // Force retry
        }}
        className="mt-2 text-xs text-blue-500 hover:underline"
      >
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
            {/* Debug info - remove in production */}
            <p className={`text-xs mt-2 ${muted}`}>Debug: {notifications.length} items loaded, Total: {totalCount}</p>
          </div>
        ) : (
          notifications.map((notification, index) => {
            // Handle cases where notification might be null/undefined
            if (!notification) return null
            
            const { 
              id = `notification-${index}`, 
              type = 'default', 
              title = 'Notification', 
              message = 'No message', 
              read = false, 
              time, 
              created_at,
              timestamp
            } = notification

            // Use fallback for time display
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
            View All ({displayCount})
          </button>
        </div>
      )}
    </div>
  )
}