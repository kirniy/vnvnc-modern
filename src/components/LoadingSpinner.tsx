import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { colors } from '../utils/colors'
import vnvncLogo from '../assets/vnvnc-logo-classic-border.svg'

type LoadingSpinnerProps = {
  inline?: boolean
  message?: string
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

const LoadingSpinner = ({ inline = false, message }: LoadingSpinnerProps) => {
  const [ringSize, setRingSize] = useState<number>(inline ? 100 : 160)
  const [glowSize, setGlowSize] = useState<number>(inline ? 140 : 220)


  useEffect(() => {
    if (inline) return
    const compute = () => {
      const vw = window.innerWidth || 375
      // Better mobile scaling
      const size = clamp(Math.round(vw * 0.25), 100, 160)
      setRingSize(size)
      setGlowSize(Math.round(size * 1.4))

    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [inline])
  return (
    <div className={inline ? 'relative flex items-center justify-center' : 'fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none'}>

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
              background: `radial-gradient(circle, ${colors.neon.red}22 0%, ${colors.neon.red}44 40%, transparent 70%)`,
              filter: 'blur(40px)'
            }}
          />
        </motion.div>

        {/* Main logo container */}
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: [`drop-shadow(0 0 10px ${colors.neon.red}66)`, `drop-shadow(0 0 25px ${colors.neon.red}aa)`, `drop-shadow(0 0 10px ${colors.neon.red}66)`]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img
            src={vnvncLogo}
            alt="VNVNC"
            className="w-full h-full object-contain p-4"
            style={{
              filter: `drop-shadow(0 0 5px ${colors.neon.red})`
            }}
          />
        </motion.div>

        {/* Circular loading ring - Outer */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{
            width: `${ringSize * 1.1}px`,
            height: `${ringSize * 1.1}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.neon.red} stopOpacity="0" />
                <stop offset="50%" stopColor={colors.neon.red} stopOpacity="1" />
                <stop offset="100%" stopColor={colors.neon.red} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Fine rotating border */}
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="0.5"
              strokeLinecap="round"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                transformOrigin: 'center'
              }}
            />

            {/* Counter-rotating segments */}
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={colors.neon.red}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="20 180"
              opacity="0.6"
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                transformOrigin: 'center'
              }}
            />
          </svg>
        </motion.div>

        {/* Inner orbit particles */}
        {[0, 180].map((rotation, index) => (
          <motion.div
            key={`orbit-${index}`}
            className="absolute"
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: colors.neon.red,
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${Math.round(ringSize * 0.6)}px)`,
              boxShadow: `0 0 10px ${colors.neon.red}, 0 0 20px ${colors.neon.red}`
            }}
            animate={{
              rotate: 360,
              opacity: [0, 1, 0]
            }}
            transition={{
              rotate: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }
            }}
          />
        ))}
      </div>

      {message && (
        <motion.div
          className="absolute mt-32 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white/60 text-xs tracking-[0.3em] uppercase font-light">{message}</span>
        </motion.div>
      )}
    </div>
  )
}

export default LoadingSpinner
