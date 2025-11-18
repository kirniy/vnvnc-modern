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
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-40 will-change-transform"
        style={{ background: colors.neon.red }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0], // Reduced movement
          y: [0, 20, 0], // Reduced movement
        }}
        transition={{
          duration: 18, // Slower duration
          repeat: Infinity,
          ease: "linear", // Linear is cheaper than easeInOut
        }}
      />

      {/* Animated Red Gradient 2 (Bottom-Right ish) */}
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-30 will-change-transform"
        style={{ background: colors.neon.red }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -20, 0], // Reduced movement
          y: [0, -20, 0], // Reduced movement
        }}
        transition={{
          duration: 25, // Slower duration
          repeat: Infinity,
          ease: "linear",
          delay: 2
        }}
      />

      {/* Animated Red Gradient 3 (Center-ish) - Static on mobile via CSS if possible, but here just simplified */}
      <motion.div
        className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full blur-[80px] opacity-20 will-change-[opacity,transform]"
        style={{ background: colors.neon.red }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.05, 1], // Very subtle scale
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
          delay: 5
        }}
      />

      {/* Static Noise Overlay - Lightweight */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette to darken edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* Bottom Ambient Glow (Matches Footer) - Static to save resources */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] opacity-50 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 100%, ${colors.neon.red}30 0%, transparent 70%)` }}
      />
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
