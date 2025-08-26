import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../utils/colors'

interface VideoCircleButtonProps {
  onClick: () => void
  isLoading?: boolean
  isRandomizing?: boolean
  className?: string
}

const VideoCircleButton = ({ onClick, isLoading = false, isRandomizing = false, className = '' }: VideoCircleButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    setRipples([...ripples, ripple])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), 1000)
    onClick()
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={`px-10 py-5 radius-lg backdrop-blur-md text-white transition-all duration-700 mx-auto relative overflow-hidden ${className}`}
      style={{ 
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(255, 0, 64, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
          : 'rgba(255, 255, 255, 0.01)',
        border: `1.5px solid ${isHovered ? 'rgba(255, 0, 64, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
        boxShadow: isHovered
          ? '0 8px 32px rgba(255, 0, 64, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        minWidth: '320px'
      }}
    >
      {/* Sophisticated shimmer */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-y-0 w-1/3 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
              background: colors.neon.red,
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 40, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Button content */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        {isLoading || isRandomizing ? (
          <motion.div
            className="flex items-center gap-4"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="block w-5 h-5 rounded-full border-2 border-t-transparent"
              style={{ borderColor: `${colors.neon.red} transparent ${colors.neon.red} ${colors.neon.red}` }}
            />
            <span className="text-base font-light tracking-wider uppercase">
              Открываем портал
            </span>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4 w-full">
              {/* Portal icon */}
              <motion.div 
                className="relative"
                animate={isHovered ? { rotate: 180 } : {}}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <span className="block w-6 h-6 rounded-full border-2" 
                      style={{ borderColor: isHovered ? colors.neon.red : 'rgba(255, 255, 255, 0.6)' }}>
                  <span className="absolute inset-2 rounded-full bg-current opacity-60" />
                </span>
              </motion.div>
              
              <motion.h3 
                className="text-lg font-light tracking-wider uppercase"
                animate={isHovered ? { letterSpacing: '0.15em' } : { letterSpacing: '0.1em' }}
                transition={{ duration: 0.3 }}
              >
                Портал в Виновницу
              </motion.h3>
            </div>
          </>
        )}
      </div>

      {/* Refined particle burst */}
      <AnimatePresence>
        {isRandomizing && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={`particle-${i}`}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: colors.neon.red,
                  left: '50%',
                  top: '50%',
                  boxShadow: `0 0 4px ${colors.neon.red}`,
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [1, 0],
                  x: Math.cos((i * Math.PI) / 4) * 100,
                  y: Math.sin((i * Math.PI) / 4) * 100,
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.03,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default VideoCircleButton