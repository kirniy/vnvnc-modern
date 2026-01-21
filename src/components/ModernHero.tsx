import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Ticket, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { colors } from '../utils/colors'
import VideoCircle from './VideoCircle'
import { LampLight } from './LampLight'
import { useRef, useState, useEffect } from 'react'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'
import { easing, duration, scale } from '../utils/motion'

const ModernHero = () => {
  const backgroundVideoRef = useRef<HTMLVideoElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isVideoCircleExpanded, setIsVideoCircleExpanded] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render motion components until mounted to avoid DOM access issues
  if (!isMounted) {
    return (
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-black pt-safe pb-safe">
        <div className="text-center text-white">
          <div className="animate-pulse">
            Loading...
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-black pt-safe pb-safe">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          ref={backgroundVideoRef}
          src="/herovideo-optimized.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Убираем старый паттерн точек */}
      <div className="absolute inset-0" />

      {/* Animated gradient overlay */}
      {prefersReducedMotion ? (
        <div
          className="absolute inset-0 z-[6]"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.neon.red}10 0%, transparent 55%)`,
          }}
        />
      ) : (
        <motion.div
          className="absolute inset-0 z-[6]"
          animate={{
            background: [
              `radial-gradient(circle at 20% 50%, ${colors.neon.red}11 0%, transparent 50%)`,
              `radial-gradient(circle at 80% 50%, ${colors.neon.red}11 0%, transparent 50%)`,
              `radial-gradient(circle at 20% 50%, ${colors.neon.red}11 0%, transparent 50%)`,
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6, // Faster - 1s was too slow for nightclub vibe
            delay: 0.1,
            ease: easing.outQuart, // ease-out for entering elements
          }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Enhanced tagline - Now the main focus */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15,
              ease: easing.outQuart,
            }}
            className="relative space-y-2 sm:space-y-3 mb-8 sm:mb-12 mt-4 sm:mt-0"
          >
            {/* Lamp effect as decoration above text */}
            <AnimatePresence>
              {!isVideoCircleExpanded && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LampLight />
                </motion.div>
              )}
            </AnimatePresence>

            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white font-display font-extrabold tracking-tight">
              Эпицентр ночной жизни
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 sm:text-white/80">
              Санкт-Петербурга
            </p>
            <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] sm:tracking-[0.3em] font-semibold"
               style={{ color: colors.neon.red }}>
              Concert Hall • Est. 2018
            </p>
          </motion.div>

          {/* Video Circles Feature - ensure it's above particles */}
          <VideoCircle
            className="my-12 sm:my-16 relative z-10"
            backgroundVideoRef={backgroundVideoRef}
            onExpandChange={setIsVideoCircleExpanded}
          />

           <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center mt-2">
            <Link to="/events" className="flex-1 sm:flex-none">
              <motion.button
                whileHover={{
                  scale: scale.buttonHover, // 1.02 - prevents hover flicker
                  boxShadow: '0 0 20px rgba(255,255,255,0.15)',
                }}
                whileTap={{ scale: scale.buttonTap }} // 0.98
                transition={{
                  scale: { type: 'spring', stiffness: 400, damping: 25 },
                  boxShadow: { duration: duration.fast },
                }}
                className="border-2 border-white text-white px-3 sm:px-6 py-2.5 sm:py-3 h-11 sm:h-12 radius font-semibold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-black flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm w-full sm:w-auto"
                style={{ transition: `background-color ${duration.fast * 1000}ms cubic-bezier(0.165, 0.84, 0.44, 1), color ${duration.fast * 1000}ms cubic-bezier(0.165, 0.84, 0.44, 1)` }}
              >
                <Calendar size={18} className="sm:w-5 sm:h-5" />
                <span>афиша</span>
              </motion.button>
            </Link>

            <Link to="/reservations" className="flex-1 sm:flex-none">
              <motion.button
                whileHover={{
                  scale: scale.buttonHover,
                  boxShadow: '0 0 20px rgba(255,255,255,0.15)',
                }}
                whileTap={{ scale: scale.buttonTap }}
                transition={{
                  scale: { type: 'spring', stiffness: 400, damping: 25 },
                  boxShadow: { duration: duration.fast },
                }}
                className="border-2 border-white text-white px-3 sm:px-6 py-2.5 sm:py-3 h-11 sm:h-12 radius font-semibold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-black flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm w-full sm:w-auto whitespace-nowrap"
                style={{ transition: `background-color ${duration.fast * 1000}ms cubic-bezier(0.165, 0.84, 0.44, 1), color ${duration.fast * 1000}ms cubic-bezier(0.165, 0.84, 0.44, 1)` }}
              >
                <Ticket size={18} className="sm:w-5 sm:h-5" />
                <span>бронь</span>
              </motion.button>
            </Link>
          </div>

          {/* Enhanced location display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.4,
              ease: easing.outQuart,
            }}
            className="flex items-center justify-center gap-2"
          >
            <a 
              href="https://yandex.ru/maps/-/CHDQRW0Z" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 radius backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 no-underline"
              style={{ backgroundColor: colors.glass.white, textDecoration: 'none' }}
            >
              <MapPin size={14} className="sm:w-4 sm:h-4" style={{ color: colors.neon.red }} />
              <span className="text-white/80 text-xs sm:text-sm hover:text-white transition-colors" style={{ textDecoration: 'none' }}>
                <span className="hidden sm:inline">Конюшенная площадь 2В, Санкт-Петербург</span>
                <span className="sm:hidden">Конюшенная площадь 2В</span>
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* Floating particles - removed for performance */ }
      </div>

    </section>
  )
}

export default ModernHero
