import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../utils/colors'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import vnvncLogo from '../assets/vnvnc-logo-classic-border.svg'

interface AgeGateProps {
  onVerify: () => void
}

const AgeGate = ({ onVerify }: AgeGateProps) => {
  const [isExiting, setIsExiting] = useState(false)

  // Use the custom hook for body scroll lock
  useBodyScrollLock(true)

  const handleConfirm = () => {
    setIsExiting(true)
    // Wait for exit animation
    setTimeout(() => {
      onVerify()
    }, 500)
  }

  const handleExit = () => {
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ'
  }

  // Return null if document.body doesn't exist yet
  if (typeof document === 'undefined' || !document.body) {
    return null
  }

  return createPortal(
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          // Transparent background so we see the Curtains (Loader) underneath
          style={{ backgroundColor: 'transparent' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative max-w-sm w-full"
          >
            {/* Frosted Glass Card - Valentine Theme */}
            <div
              className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-center border border-white/20"
              style={{
                backdropFilter: 'blur(25px) saturate(180%)',
                backgroundColor: 'rgba(255, 180, 200, 0.04)',
                boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 50px rgba(255,0,64,0.12), inset 0 0 30px rgba(255,200,210,0.06)`
              }}
            >

              {/* Texture Overlay */}
              <div
                className="relative inset-0 pointer-events-none opacity-15 mix-blend-overlay"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.5\'/%3E%3C/svg%3E")'
                }}
              />

              {/* Logo */}
              <motion.div
                className="mb-10 relative z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="flex justify-center flex-col items-center gap-2">
                  <img
                    src={vnvncLogo}
                    alt="VNVNC"
                    className="w-28 h-28 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
                  />
                </div>
              </motion.div>

              {/* Question */}
              <div className="relative z-10 mb-10 space-y-3">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] border-4 border-white/20">
                    <span className="text-3xl font-black text-black tracking-tighter font-display transform translate-y-0.5">
                      18+
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white/90 uppercase tracking-widest">
                  ВАМ ЕСТЬ 18 ЛЕТ?
                </h3>
                <div className="h-px w-16 bg-white/30 mx-auto my-4" />
                <p className="text-white/70 text-xs font-medium tracking-wide uppercase">
                  Доступ только для совершеннолетних
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="w-full py-4 rounded-xl font-black text-black text-lg uppercase tracking-wide relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                    boxShadow: '0 4px 20px rgba(255,255,255,0.3)'
                  }}
                >
                  <span className="relative z-10">ДА, МНЕ ЕСТЬ 18</span>
                  <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExit}
                  className="w-full py-4 rounded-xl font-bold text-white/70 text-sm uppercase tracking-wider border border-white/10 transition-colors"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  НЕТ, ВЕРНУТЬСЯ
                </motion.button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default AgeGate
