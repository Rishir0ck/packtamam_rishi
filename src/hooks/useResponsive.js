import { useState, useEffect } from 'react'

export default function useResponsive() {
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    const checkSupport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768
      const isTabletVertical = width >= 768 && width < 1024 && height > width
      
      setIsSupported(!isMobile && !isTabletVertical)
    }

    checkSupport()
    window.addEventListener('resize', checkSupport)
    window.addEventListener('orientationchange', checkSupport)

    return () => {
      window.removeEventListener('resize', checkSupport)
      window.removeEventListener('orientationchange', checkSupport)
    }
  }, [])

  return { isSupported }
}