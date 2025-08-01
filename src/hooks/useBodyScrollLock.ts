import { useEffect } from 'react'

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Store the current overflow value
      const originalOverflow = document.body.style.overflow
      
      // Add lock styles
      document.body.style.overflow = 'hidden'
      
      // Prevent iOS rubber band scrolling
      const scrollBarCompensation = window.innerWidth - document.body.offsetWidth
      document.body.style.paddingRight = `${scrollBarCompensation}px`
      
      return () => {
        // Restore original overflow
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = ''
      }
    }
  }, [isLocked])
}