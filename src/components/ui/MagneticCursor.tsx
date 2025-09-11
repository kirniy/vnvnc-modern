import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

/**
 * Beautiful magnetic cursor with smooth physics-based animations
 * Features:
 * - Liquid morphing effects on hover
 * - Magnetic attraction to interactive elements
 * - Rainbow gradient trail effect
 * - Particle explosions on click
 * - GPU-accelerated transforms only
 */
const MagneticCursor = () => {
  const [enabled, setEnabled] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  
  // Spring physics for smooth movement
  const springConfig = { damping: 25, stiffness: 300 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)
  
  // Trail effect with more damping
  const trailX = useSpring(0, { damping: 35, stiffness: 150 })
  const trailY = useSpring(0, { damping: 35, stiffness: 150 })
  
  // Transform for scale effects
  const scale = useSpring(1, { damping: 20, stiffness: 400 })
  const rotation = useSpring(0, { damping: 30, stiffness: 200 })
  
  useEffect(() => {
    // Check for mouse support and reduced motion
    const hasPointer = window.matchMedia('(pointer: fine)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (!hasPointer || prefersReduced) {
      setEnabled(false)
      return
    }
    
    // Hide default cursor
    if (document.body) {
      document.body.style.cursor = 'none'
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      trailX.set(e.clientX)
      trailY.set(e.clientY)
      
      // Check if hovering over interactive elements
      const target = e.target as HTMLElement
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.onclick !== null ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') !== null ||
        target.closest('a') !== null
      
      setIsHovering(isInteractive)
      
      // Magnetic effect for interactive elements
      if (isInteractive) {
        const rect = (target.closest('button') || target.closest('a') || target).getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        // Calculate magnetic pull
        const deltaX = centerX - e.clientX
        const deltaY = centerY - e.clientY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        
        if (distance < 50) {
          const pullStrength = (1 - distance / 50) * 15
          x.set(e.clientX + deltaX * pullStrength / distance)
          y.set(e.clientY + deltaY * pullStrength / distance)
          scale.set(1.2 + (1 - distance / 50) * 0.3)
        }
      } else {
        scale.set(1)
      }
    }
    
    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true)
      scale.set(0.8)
      rotation.set(180)
      
      // Create particle explosion
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: e.clientX,
        y: e.clientY,
      }))
      setParticles(prev => [...prev, ...newParticles])
      
      // Clean up particles after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)))
      }, 1000)
    }
    
    const handleMouseUp = () => {
      setIsClicking(false)
      scale.set(isHovering ? 1.2 : 1)
      rotation.set(0)
    }
    
    const handleMouseLeave = () => {
      scale.set(0)
    }
    
    const handleMouseEnter = () => {
      scale.set(1)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    if (document.body) {
      document.body.addEventListener('mouseleave', handleMouseLeave)
      document.body.addEventListener('mouseenter', handleMouseEnter)
    }
    
    return () => {
      if (document.body) {
        document.body.style.cursor = 'auto'
        document.body.removeEventListener('mouseleave', handleMouseLeave)
        document.body.removeEventListener('mouseenter', handleMouseEnter)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [x, y, trailX, trailY, scale, rotation, isHovering])
  
  if (!enabled) return null
  
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {/* Trail effect - larger, softer */}
      <motion.div
        className="absolute w-10 h-10"
        style={{
          x: useTransform(trailX, v => v - 20),
          y: useTransform(trailY, v => v - 20),
          scale: useTransform(scale, v => v * 0.8),
        }}
      >
        <div 
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,26,26,0.1) 0%, rgba(255,100,100,0.05) 40%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      </motion.div>
      
      {/* Main cursor */}
      <motion.div
        className="absolute"
        style={{
          x: useTransform(x, v => v - 16),
          y: useTransform(y, v => v - 16),
          scale,
          rotate: rotation,
        }}
      >
        {/* Outer ring with gradient */}
        <div 
          className={`absolute inset-0 w-8 h-8 rounded-full transition-all duration-200 ${
            isHovering ? 'w-10 h-10 -m-1' : ''
          }`}
          style={{
            background: isClicking 
              ? 'conic-gradient(from 0deg, #ff1a1a, #ff6b6b, #ff1a1a)'
              : isHovering
              ? 'conic-gradient(from 45deg, #ff1a1a, #ff00ff, #00ffff, #ff1a1a)'
              : 'conic-gradient(from 90deg, rgba(255,26,26,0.8), rgba(255,100,100,0.4), rgba(255,26,26,0.8))',
            animation: isHovering ? 'spin 2s linear infinite' : undefined,
            boxShadow: `
              0 0 20px rgba(255,26,26,0.5),
              inset 0 0 10px rgba(255,255,255,0.2)
            `,
          }}
        />
        
        {/* Inner dot with glow */}
        <div 
          className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: '#fff',
            boxShadow: `
              0 0 10px rgba(255,255,255,0.9),
              0 0 20px rgba(255,26,26,0.8),
              0 0 30px rgba(255,26,26,0.6)
            `,
            transform: `translate(-50%, -50%) scale(${isClicking ? 1.5 : 1})`,
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        {/* Hover effect ring */}
        {isHovering && (
          <div 
            className="absolute inset-0 w-12 h-12 -m-2 rounded-full animate-ping"
            style={{
              border: '2px solid rgba(255,26,26,0.4)',
              animationDuration: '1s',
            }}
          />
        )}
      </motion.div>
      
      {/* Click particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          initial={{ 
            x: particle.x - 4, 
            y: particle.y - 4,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: particle.x - 4 + (Math.random() - 0.5) * 100,
            y: particle.y - 4 + (Math.random() - 0.5) * 100,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            background: `hsl(${Math.random() * 60}, 100%, 60%)`,
            boxShadow: '0 0 6px currentColor',
          }}
        />
      ))}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default MagneticCursor