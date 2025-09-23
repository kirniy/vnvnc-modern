import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { colors } from '../utils/colors'

type LoadingSpinnerProps = {
  inline?: boolean
  message?: string
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

const LoadingSpinner = ({ inline = false, message }: LoadingSpinnerProps) => {
  const [ringSize, setRingSize] = useState<number>(inline ? 100 : 160)
  const [glowSize, setGlowSize] = useState<number>(inline ? 140 : 220)
  const [fontSize, setFontSize] = useState<string>(inline ? 'text-3xl' : 'text-4xl md:text-5xl')

  useEffect(() => {
    if (inline) return
    const compute = () => {
      const vw = window.innerWidth || 375
      // Better mobile scaling
      const size = clamp(Math.round(vw * 0.25), 100, 160)
      setRingSize(size)
      setGlowSize(Math.round(size * 1.4))
      // Adjust font size based on viewport
      if (vw < 640) {
        setFontSize('text-3xl')
      } else {
        setFontSize('text-4xl')
      }
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [inline])
  return (
    <div className={inline ? 'relative flex items-center justify-center' : 'fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none'}
    >
      
      <div className="relative flex items-center justify-center pointer-events-none" style={{ width: `${ringSize}px`, height: `${ringSize}px` }}>
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
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.15, 0.4]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.neon.red}11 0%, ${colors.neon.red}44 50%, transparent 100%)`,
              filter: 'blur(30px)'
            }}
          />
        </motion.div>
        
        {/* Main logo container */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.span
            className={`font-display font-extrabold ${fontSize} lowercase tracking-wider select-none`}
            style={{
              color: colors.neon.red,
              textShadow: `0 0 20px ${colors.neon.red}88, 0 0 40px ${colors.neon.red}44, 0 0 80px ${colors.neon.red}22`,
              letterSpacing: '0.08em'
            }}
            animate={{
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            vnvnc
          </motion.span>
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
              strokeWidth="1"
              opacity="0.08"
            />
            
            {/* Animated progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={colors.neon.red}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="90 211"
              animate={{
                rotate: 360,
                strokeDasharray: ["90 211", "150 151", "90 211"],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                rotate: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear"
                },
                strokeDasharray: {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                opacity: {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              style={{
                filter: `drop-shadow(0 0 15px ${colors.neon.red}) drop-shadow(0 0 30px ${colors.neon.red}66)`,
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
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="40 260"
              opacity="0.4"
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                transformOrigin: 'center'
              }}
            />
          </svg>
        </motion.div>
        
        {/* Inner orbit dots */}
        {[0, 120, 240].map((rotation, index) => (
          <motion.div
            key={`inner-${rotation}`}
            className="absolute"
            style={{
              width: '2px',
              height: '2px',
              backgroundColor: colors.neon.red,
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${Math.round(ringSize * 0.25)}px)`,
              boxShadow: `0 0 8px ${colors.neon.red}`
            }}
            animate={{
              rotate: 360,
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              },
              opacity: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
              }
            }}
          />
        ))}

        {/* Corner accent dots */}
        {[0, 90, 180, 270].map((rotation, index) => (
          <motion.div
            key={rotation}
            className="absolute"
            style={{
              width: inline ? '2px' : '3px',
              height: inline ? '2px' : '3px',
              backgroundColor: colors.neon.red,
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${Math.round(ringSize * 0.55)}px)`,
              boxShadow: `0 0 12px ${colors.neon.red}, 0 0 20px ${colors.neon.red}66`
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.5, 1]
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
