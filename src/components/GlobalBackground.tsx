import { motion } from 'framer-motion'
import { memo } from 'react'

const GlobalBackground = memo(() => {

  return (
    <div className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-black">
      {/* Base gradient - Static on mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0f1e] to-[#051020]" />

      {/* Animated Orbs - Disabled animation on mobile for performance */}
      <motion.div
        className="hidden md:block absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-30 should-accelerate"
        style={{ background: '#0891b2' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15, // Slower
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-20 should-accelerate"
        style={{ background: '#1e3a8a' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Subtle White/Silver Highlight (Lighting) */}
      <motion.div
        className="hidden md:block absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-10 will-change-[opacity,transform]"
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

      {/* Static Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.2] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette to darken edges and focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />

      {/* Bottom Ambient Glow - Winter Blue */}
      <div className="absolute bottom-0 left-0 right-0 h-[400px] opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 100%, #06b6d420 0%, transparent 70%)` }}
      />
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
