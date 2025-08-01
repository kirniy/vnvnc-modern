import { motion } from 'framer-motion'
import { colors } from '../utils/colors'

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${colors.neon.red}08 0%, transparent 50%)`,
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
      </div>
      
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0"
          style={{
            width: '300px',
            height: '300px',
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
          className="relative z-10"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Logo */}
          <motion.img 
            src="/logo.png" 
            alt="VNVNC" 
            className="h-32 w-auto"
            style={{ 
              filter: `brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(6719%) hue-rotate(341deg) brightness(105%) contrast(120%) drop-shadow(0 0 30px ${colors.neon.red}) drop-shadow(0 0 60px ${colors.neon.red}44)`
            }}
            animate={{
              filter: [
                `brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(6719%) hue-rotate(341deg) brightness(105%) contrast(120%) drop-shadow(0 0 30px ${colors.neon.red}) drop-shadow(0 0 60px ${colors.neon.red}44)`,
                `brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(6719%) hue-rotate(341deg) brightness(120%) contrast(130%) drop-shadow(0 0 40px ${colors.neon.red}) drop-shadow(0 0 80px ${colors.neon.red}66)`,
                `brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(6719%) hue-rotate(341deg) brightness(105%) contrast(120%) drop-shadow(0 0 30px ${colors.neon.red}) drop-shadow(0 0 60px ${colors.neon.red}44)`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        {/* Circular loading ring */}
        <motion.div
          className="absolute inset-0"
          style={{
            width: '250px',
            height: '250px',
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
              width: '4px',
              height: '4px',
              backgroundColor: colors.neon.red,
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-140px)`,
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
      
      {/* Loading text with dots animation */}
      <motion.div
        className="mt-20 flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-white/80 text-sm tracking-[0.3em] uppercase font-light">Loading</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="text-white/80 text-sm"
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2
              }}
            >
              •
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default LoadingSpinner
