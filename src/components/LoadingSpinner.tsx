import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { colors } from '../utils/colors'

type LoadingSpinnerProps = {
  inline?: boolean
  message?: string
  scrimOpacity?: number // 0..1, only for fullscreen
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

const LoadingSpinner = ({ inline = false, message, scrimOpacity = 0.85 }: LoadingSpinnerProps) => {
  const [ringSize, setRingSize] = useState<number>(inline ? 120 : 200)
  const [glowSize, setGlowSize] = useState<number>(inline ? 160 : 260)
  const [fontSize, setFontSize] = useState<string>(inline ? 'text-4xl' : 'text-5xl md:text-6xl')

  useEffect(() => {
    if (inline) return
    const compute = () => {
      const vw = window.innerWidth || 375
      // ring tuned for mobile; keep smaller to avoid cutoffs
      const size = clamp(Math.round(vw * 0.36), 140, 220)
      setRingSize(size)
      setGlowSize(Math.round(size * 1.25))
      // Adjust font size based on viewport
      if (vw < 640) {
        setFontSize('text-5xl')
      } else {
        setFontSize('text-6xl')
      }
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [inline])
  return (
    <div className={inline ? 'relative flex flex-col items-center justify-center' : 'fixed inset-0 z-[9998] flex flex-col items-center justify-center min-h-[100svh] overflow-hidden pt-safe pb-safe'}
      style={!inline ? { backgroundColor: `rgba(0,0,0,${scrimOpacity})` } : undefined}
    >
      {/* Background gradient effect */}
      {!inline && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${colors.neon.red}08 0%, transparent 50%)`,
              animation: 'pulse 4s ease-in-out infinite'
            }}
          />
        </div>
      )}
      
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0"
          style={{
            width: `${glowSize}px`,
            height: `${glowSize}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, transparent 40%, ${colors.neon.red}22 70%, transparent 100%)`,
              filter: 'blur(20px)'
            }}
          />
        </motion.div>
        
        {/* Main logo container */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className={`font-display font-extrabold ${fontSize} lowercase`}
                style={{ color: colors.neon.red }}>
            vnvnc
          </span>
        </motion.div>
        
        {/* Circular loading ring */}
        <motion.div
          className="absolute inset-0"
          style={{
            width: `${ringSize}px`,
            height: `${ringSize}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={colors.neon.red}
              strokeWidth="0.5"
              opacity="0.1"
            />
            
            {/* Animated progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={colors.neon.red}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="100 201"
              animate={{
                rotate: 360,
                strokeDasharray: ["100 201", "150 151", "100 201"]
              }}
              transition={{
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                },
                strokeDasharray: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              style={{
                filter: `drop-shadow(0 0 20px ${colors.neon.red})`,
                transformOrigin: 'center'
              }}
            />
            
            {/* Secondary rotating ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={colors.neon.red}
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeDasharray="20 280"
              opacity="0.5"
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                transformOrigin: 'center'
              }}
            />
          </svg>
        </motion.div>
        
        {/* Corner accent dots */}
        {[0, 90, 180, 270].map((rotation, index) => (
          <motion.div
            key={rotation}
            className="absolute"
            style={{
              width: inline ? '3px' : '4px',
              height: inline ? '3px' : '4px',
              backgroundColor: colors.neon.red,
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${Math.round(ringSize * 0.56)}px)`,
              boxShadow: `0 0 10px ${colors.neon.red}`
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5
            }}
          />
        ))}
      </div>
      
      {message && (
        <motion.div
          className="mt-6 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white/80 text-sm tracking-[0.2em] uppercase font-light">{message}</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="text-white/80 text-sm"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
              >
                •
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default LoadingSpinner
