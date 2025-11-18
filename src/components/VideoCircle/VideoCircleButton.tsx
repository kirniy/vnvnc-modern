import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import { colors } from '../../utils/colors'

interface VideoCircleButtonProps {
  onClick: () => void
  isLoading?: boolean
  isRandomizing?: boolean
  className?: string
}

const VideoCircleButton = memo(({ onClick, isLoading = false, isRandomizing = false, className = '' }: VideoCircleButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={`group relative flex items-center justify-center gap-3 px-8 py-4 
        rounded-full transition-all duration-300 mx-auto
        ${className}`}
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: `1px solid ${isHovered ? colors.neon.red : 'rgba(255, 255, 255, 0.2)'}`,
        boxShadow: isHovered 
          ? `0 0 20px ${colors.neon.red}30` 
          : '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}
    >
      {/* Inner Ring */}
      <div className="absolute inset-[2px] rounded-full border border-white/5 bg-black/20" />

      {/* Icon Container */}
      <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:border-red-500/50 transition-colors duration-300">
        <motion.div
          animate={isHovered ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Custom Portal Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="group-hover:stroke-red-500 transition-colors">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </motion.div>
      </div>

      {/* Text */}
      <div className="relative z-10 flex flex-col items-start justify-center">
        <span className="text-sm sm:text-base uppercase tracking-[0.15em] text-white font-bold leading-none group-hover:text-red-500 transition-colors duration-300 text-shadow-neon font-display">
          {isLoading || isRandomizing ? 'ОТКРЫВАЕМ...' : 'ПОРТАЛ В ВИНОВНИЦУ'}
        </span>
      </div>
    </motion.button>
  )
})

VideoCircleButton.displayName = 'VideoCircleButton'

export default VideoCircleButton