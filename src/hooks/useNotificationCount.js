// hooks/useNotificationCount.js
import { useState, useEffect } from 'react'
import adminApiService from '../Firebase/services/adminApiService'

export const useNotificationCount = () => {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchCount = async () => {
    try {
      setLoading(true)
      const response = await adminApiService.getNotificationCount()
      const notificationCount = typeof response === 'number' ? response : 
                              response?.count || response?.total || response?.data || 0
      setCount(notificationCount)
    } catch (error) {
      console.error('Failed to fetch notification count:', error)
      setCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  return { count, loading, refreshCount: fetchCount }
}