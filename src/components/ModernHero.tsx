import { motion } from 'framer-motion'
import { ChevronDown, Calendar, Ticket, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { colors } from '../utils/colors'
import VideoCircle from './VideoCircle'
import { useRef } from 'react'

const ModernHero = () => {
  const backgroundVideoRef = useRef<HTMLVideoElement>(null)

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-black pt-safe pb-safe">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          ref={backgroundVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Убираем старый паттерн точек */}
      <div className="absolute inset-0" />

      {/* Animated gradient overlay */}
        <motion.div
        className="absolute inset-0"
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
          ease: "linear",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Enhanced tagline - Now the main focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3 mb-12"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl text-white font-display font-extrabold tracking-tight">
              Эпицентр ночной жизни
            </h1>
            <p className="text-xl md:text-2xl text-white/80">
              Санкт-Петербурга
            </p>
            <p className="text-sm md:text-base uppercase tracking-[0.3em] font-semibold"
               style={{ color: colors.neon.red }}>
              Concert Hall • Est. 2018
            </p>
          </motion.div>

          {/* Video Circles Feature - ensure it's above particles */}
          <VideoCircle className="my-16 relative z-10" backgroundVideoRef={backgroundVideoRef} />

           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-2">
            <Link to="/events">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                 className="border-2 border-white text-white px-6 py-3 h-12 radius font-semibold text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
              >
                <Calendar size={20} />
                Афиша
              </motion.button>
            </Link>

            <Link to="/reservations">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                 className="border-2 border-white text-white px-6 py-3 h-12 radius font-semibold text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
              >
                <Ticket size={20} />
                Бронировать стол
              </motion.button>
            </Link>
          </div>

          {/* Enhanced location display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-2"
          >
            <a 
              href="https://yandex.ru/maps/-/CHDQRW0Z" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 radius backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 no-underline"
              style={{ backgroundColor: colors.glass.white, textDecoration: 'none' }}
            >
              <MapPin size={16} style={{ color: colors.neon.red }} />
              <span className="text-white/80 text-sm hover:text-white transition-colors" style={{ textDecoration: 'none' }}>Конюшенная площадь 2В, Санкт-Петербург</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Floating particles - behind content with z-0 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: `${colors.neon.red}30` }}
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-sm text-gray-400">Подробнее</span>
          <ChevronDown size={24} className="text-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default ModernHero
