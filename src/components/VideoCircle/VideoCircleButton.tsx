import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../utils/colors'

interface VideoCircleButtonProps {
  onClick: () => void
  isLoading?: boolean
  isRandomizing?: boolean
  className?: string
}

const VideoCircleButton = ({ onClick, isLoading = false, isRandomizing = false, className = '' }: VideoCircleButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className={`px-6 py-3 radius backdrop-blur-sm border border-white/20 text-white hover:border-white/40 transition-all duration-300 flex items-center gap-2 mx-auto relative overflow-hidden group ${className}`}
      style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${colors.neon.red}20 50%, transparent 60%)`,
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'easeInOut',
        }}
      />

      {/* Button content */}
      <span className="relative flex items-center gap-2">
        {isLoading || isRandomizing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6"/>
                <path d="M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"/>
                <path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14"/>
              </svg>
            </motion.div>
            <span className="font-medium">Загружаем момент...</span>
          </>
        ) : (
          <>
            <motion.div
              animate={isRandomizing ? { rotate: 360 } : {}}
              transition={{ duration: 0.5 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6"/>
                <path d="M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"/>
                <path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14"/>
              </svg>
            </motion.div>
            <span className="font-medium">Случайный момент</span>
          </>
        )}
      </span>

      {/* Amazing particle effects on click */}
      <AnimatePresence>
        {isRandomizing && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: colors.neon.red,
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: Math.cos((i * Math.PI * 2) / 12) * 60,
                  y: Math.sin((i * Math.PI * 2) / 12) * 60,
                  opacity: [1, 0.5, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
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