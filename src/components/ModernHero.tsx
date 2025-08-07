import { motion } from 'framer-motion'
import { ChevronDown, Calendar, Ticket, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { colors } from '../utils/colors'
import WarpedVNVNC from './logo/WarpedVNVNC'

const ModernHero = () => {

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
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

      {/* Grid overlay with dots pattern like reference */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

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
          {/* Enhanced VNVNC Branding */}
          <div className="relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-full h-32 md:h-48"
                style={{
                  background: `radial-gradient(ellipse at center, ${colors.neon.red}40 0%, transparent 70%)`,
                  filter: 'blur(40px)',
                  transform: 'scale(1.5)',
                }}
              />
            </div>
            
            {/* Main logo with enhanced styling */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative flex justify-center"
            >
              <WarpedVNVNC height={120} animated className="md:h-32 lg:h-40" />
            </motion.div>
            
            {/* Subtle underline effect */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-0.5 w-32 md:w-48 mx-auto mt-4"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.neon.red}, transparent)`,
                boxShadow: `0 0 20px ${colors.neon.red}`,
              }}
            />
          </div>

          {/* Enhanced tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-2"
          >
            <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide">
              Эпицентр ночной жизни Санкт-Петербурга
            </p>
            <p className="text-sm md:text-base uppercase tracking-[0.3em] font-semibold"
               style={{ color: colors.neon.red }}>
              Concert Hall
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/events">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/10"
                style={{ 
                  backgroundColor: colors.neon.red,
                  boxShadow: `0 4px 20px ${colors.neon.red}66`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 30px ${colors.neon.red}99`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 4px 20px ${colors.neon.red}66`
                }}
              >
                <Calendar size={20} />
                Афиша
              </motion.button>
            </Link>

            <Link to="/reservations">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
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
            <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10"
                 style={{ backgroundColor: colors.glass.white }}>
              <MapPin size={16} style={{ color: colors.neon.red }} />
              <span className="text-white/80 text-sm">Конюшенная площадь 2В, Санкт-Петербург</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
