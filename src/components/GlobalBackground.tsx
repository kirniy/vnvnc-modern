import { motion } from 'framer-motion'
import { colors } from '../utils/colors'
import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 -z-50 bg-black overflow-hidden pointer-events-none">
      {/* Deep dark base to ensure black theme */}
      <div className="absolute inset-0 bg-black" />

      {/* Animated Red Gradient 1 (Top-Left ish) */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-20"
        style={{ background: colors.neon.red }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated Red Gradient 2 (Bottom-Right ish) */}
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-15"
        style={{ background: colors.neon.red }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Animated Red Gradient 3 (Center-ish, very subtle pulsing) */}
      <motion.div
        className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full blur-[80px] opacity-10"
        style={{ background: colors.neon.red }}
        animate={{
          opacity: [0.05, 0.15, 0.05],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />

      {/* Vignette to darken edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* Bottom Ambient Glow (Matches Footer) - Static to save resources */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 100%, ${colors.neon.red}20 0%, transparent 70%)` }}
      />
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
