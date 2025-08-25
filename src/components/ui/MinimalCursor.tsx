import { useEffect, useState, useRef } from 'react'

/**
 * Minimalistic clean cursor - simple circle with red dot
 * Smooth, performant, and elegant
 */
const MinimalCursor = () => {
  const [enabled, setEnabled] = useState(true)
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isPointer, setIsPointer] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const mousePos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // Check for mouse support and reduced motion preference
    const hasPointer = window.matchMedia('(pointer: fine)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (!hasPointer || prefersReduced) {
      setEnabled(false)
      return
    }

    // Hide default cursor globally
    const style = document.createElement('style')
    style.innerHTML = `* { cursor: none !important; }`
    document.head.appendChild(style)

    const updatePosition = () => {
      // Direct position update - no lag
      setPosition({ x: mousePos.current.x, y: mousePos.current.y })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      updatePosition() // Instant update
      
      // Check if hovering over interactive elements
      const target = e.target as HTMLElement
      const interactive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') !== null ||
        target.closest('a') !== null
      
      setIsPointer(interactive)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    
    const handleMouseLeave = () => {
      mousePos.current = { x: -100, y: -100 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!enabled) return null

  return (
    <div 
      className="pointer-events-none fixed"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'none',
        zIndex: 2147483647, // Maximum z-index value to ensure cursor is always on top
      }}
    >
      {/* Outer circle - clean white ring */}
      <div
        className="absolute"
        style={{
          width: isPointer ? '40px' : '32px',
          height: isPointer ? '40px' : '32px',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.85 : 1})`,
          border: '2px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        }}
      />
      
      {/* Center red dot */}
      <div
        className="absolute"
        style={{
          width: '6px',
          height: '6px',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${isClicking ? 1.5 : 1})`,
          backgroundColor: '#ff1a1a',
          borderRadius: '50%',
          transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 10px rgba(255, 26, 26, 0.6)',
        }}
      />
    </div>
  )
}

export default MinimalCursor