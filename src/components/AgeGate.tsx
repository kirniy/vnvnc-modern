import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../utils/colors'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
// import WarpedVNVNC from './logo/WarpedVNVNC' - using plain text for consistency

const AgeGate = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Use the custom hook for body scroll lock
  useBodyScrollLock(isVisible)

  useEffect(() => {
    const isLikelyBot = () => {
      if (typeof navigator === 'undefined') {
        return false
      }

      const botPattern = /(googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|sogou|facebot|ia_archiver|twitterbot|facebookexternalhit|linkedinbot|mediapartners-google|adsbot-google)/i
      const ua = navigator.userAgent || ''
      const languages = navigator.languages || []

      if (botPattern.test(ua)) {
        return true
      }

      // Headless browsers often expose webdriver or have no languages set
      if ((navigator as any).webdriver || languages.length === 0) {
        return true
      }

      return false
    }

    // Skip gate entirely for bots and crawlers
    if (isLikelyBot()) {
      localStorage.setItem('vnvnc_age_verified', 'bot-skip')
      setIsVisible(false)
      return
    }

    const ageVerified = localStorage.getItem('vnvnc_age_verified')
    if (!ageVerified) {
      setIsVisible(true)
    }
  }, [])

  const handleConfirm = () => {
    // Save verification to localStorage
    localStorage.setItem('vnvnc_age_verified', 'true')
    setIsVisible(false)
  }

  const handleExit = () => {
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ'
  }

  if (!isVisible) return null

  // Return null if document.body doesn't exist yet
  if (typeof document === 'undefined' || !document.body) {
    return null
  }

  return createPortal(
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, ${colors.neon.red}08 0%, transparent 40%)`,
                animation: 'pulse 6s ease-in-out infinite'
              }}
            />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative max-w-sm w-full z-10"
          >
            <div 
              className="backdrop-blur-2xl radius p-8 md:p-10 border border-white/10 shadow-2xl text-center"
              style={{ 
                backgroundColor: colors.glass.darker,
                boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 100px ${colors.neon.red}11`
              }}
            >
              {/* Logo - matching Navigation style */}
              <motion.div 
                className="mb-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="flex justify-center">
                  <span 
                    className="font-display font-extrabold text-5xl lg:text-6xl lowercase"
                    style={{ 
                      color: colors.neon.red,
                      filter: `drop-shadow(0 0 40px ${colors.neon.red}44)`,
                      letterSpacing: '0.05em'
                    }}
                  >
                    vnvnc
                  </span>
                </div>
              </motion.div>

              {/* Question */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Вам есть 18 лет?
                </h2>
                <p className="text-white/60 text-sm">
                  Этот сайт предназначен только для совершеннолетних
                </p>
              </motion.div>

              {/* Buttons: order with YES on the right, bigger touch targets */}
              <motion.div 
                className="flex gap-3 mt-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExit}
                  className="flex-1 px-7 py-4 radius backdrop-blur-sm border-2 border-white/20 text-white font-medium transition-all duration-300 text-base md:text-lg"
                  style={{ 
                    backgroundColor: colors.glass.white
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.glass.whiteHover
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.glass.white
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  Нет
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 px-7 py-4 radius font-extrabold text-white transition-all duration-300 relative overflow-hidden group border-2 border-transparent text-base md:text-lg"
                  style={{ 
                    backgroundColor: colors.neon.red,
                    boxShadow: `0 8px 30px ${colors.neon.red}66`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 12px 40px ${colors.neon.red}88`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = `0 8px 30px ${colors.neon.red}66`
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
                  </div>
                  <span className="relative z-10">Да</span>
                </motion.button>
              </motion.div>

              {/* Legal text */}
              <motion.p 
                className="text-white/30 text-xs mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Подтверждая, вы соглашаетесь с правилами клуба
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default AgeGate
