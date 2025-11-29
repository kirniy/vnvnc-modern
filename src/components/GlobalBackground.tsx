import { motion } from 'framer-motion'
import { colors } from '../utils/colors'
import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 -z-50 bg-black overflow-hidden pointer-events-none">
      {/* Deep dark base with subtle gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)'
        }}
      />

      {/* Animated Red Gradient (Primary) */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-30 will-change-transform"
        style={{ background: colors.neon.red }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Animated Deep Purple/Blue Gradient (Secondary - Adds Depth) */}
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-20 will-change-transform"
        style={{ background: '#1a0b2e' }} // Deep purple
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
          delay: 2
        }}
      />

      {/* Subtle White/Silver Highlight (Lighting) */}
      <motion.div
        className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-5 will-change-[opacity,transform]"
        style={{ background: '#ffffff' }}
        animate={{
          opacity: [0.03, 0.08, 0.03],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
          delay: 5
        }}
      />

      {/* Static Noise Overlay - Slightly more visible for texture */}
      <div
        className="absolute inset-0 opacity-[0.2] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette to darken edges and focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />

      {/* Bottom Ambient Glow (Matches Footer) */}
      <div className="absolute bottom-0 left-0 right-0 h-[400px] opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 100%, ${colors.neon.red}20 0%, transparent 70%)` }}
      />
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
