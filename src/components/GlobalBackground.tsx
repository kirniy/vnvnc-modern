import { Component as AnimatedBackground } from './ui/raycast-animated-background'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Global background that persists across all page navigations
const GlobalBackground = () => {
  const location = useLocation()
  const [transform, setTransform] = useState('none')

  // Randomize direction on route changes
  useEffect(() => {
    // Skip on first mount to avoid flashing
    if (location.pathname === '/') {
      setTransform('none')
    } else {
      // Randomize between normal and flipped
      setTransform(Math.random() > 0.5 ? 'scaleX(-1)' : 'none')
    }
  }, [location.pathname])

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      aria-hidden
      style={{
        zIndex: -1, // Behind everything
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed',
        overflow: 'hidden'
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          filter: 'brightness(0.9)',
          transform: transform,
          transition: 'transform 0.3s ease',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <AnimatedBackground />
      </div>
    </div>
  )
}

export default GlobalBackground


