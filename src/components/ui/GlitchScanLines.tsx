import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GlitchScanLines = () => {
  const [glitchActive, setGlitchActive] = useState(false)
  const [glitchPosition, setGlitchPosition] = useState(0)

  useEffect(() => {
    // Random glitch every 3-6 seconds (more frequent for visibility)
    const scheduleGlitch = () => {
      const delay = Math.random() * 3000 + 3000 // 3-6 seconds
      
      const timeout = setTimeout(() => {
        // Trigger glitch
        setGlitchActive(true)
        setGlitchPosition(Math.random() * 80 + 10) // Random position 10-90%
        
        // End glitch after 100-200ms
        setTimeout(() => {
          setGlitchActive(false)
          scheduleGlitch() // Schedule next glitch
        }, Math.random() * 100 + 100)
      }, delay)
      
      return () => clearTimeout(timeout)
    }
    
    const cleanup = scheduleGlitch()
    return cleanup
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Subtle scan lines - always visible but very faint */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.1) 2px,
            rgba(255, 255, 255, 0.1) 4px
          )`,
        }}
      />
      
      {/* Moving scan line - subtle animation */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] opacity-[0.08]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          filter: 'blur(0.5px)',
        }}
        animate={{
          y: ['0vh', '100vh'],
        }}
        transition={{
          duration: 12,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
      
      {/* Glitch effect - occasional distortion */}
      <AnimatePresence>
        {glitchActive && (
          <>
            {/* RGB split effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  0deg,
                  transparent ${glitchPosition - 5}%,
                  rgba(255, 0, 0, 0.03) ${glitchPosition - 2}%,
                  rgba(0, 255, 0, 0.03) ${glitchPosition}%,
                  rgba(0, 0, 255, 0.03) ${glitchPosition + 2}%,
                  transparent ${glitchPosition + 5}%
                )`,
                filter: 'blur(0.8px)',
              }}
            />
            
            {/* Distortion band */}
            <motion.div
              initial={{ scaleX: 0.99, opacity: 0 }}
              animate={{ scaleX: [0.99, 1.01, 0.99], opacity: [0, 0.1, 0] }}
              exit={{ opacity: 0 }}
              className="absolute left-0 right-0 h-[20px]"
              style={{
                top: `${glitchPosition}%`,
                background: 'rgba(255, 255, 255, 0.05)',
                filter: 'blur(2px)',
                transform: 'translateZ(0)', // Force GPU acceleration
              }}
            />
            
            {/* Noise texture during glitch */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.02, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
              }}
            />
          </>
        )}
      </AnimatePresence>
      
      {/* Very subtle vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.1) 100%)',
        }}
      />
    </div>
  )
}

export default GlitchScanLines