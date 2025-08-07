import { MapPin, Phone, Clock, Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import { FaTelegram, FaInstagram, FaVk } from 'react-icons/fa'
import NeonText from './ui/NeonText'
import { colors } from '../utils/colors'
import Dither from './Dither'
import WarpedVNVNC from './logo/WarpedVNVNC'

const Footer = () => {
  return (
    <footer className="relative bg-black border-t border-white/10 text-white overflow-hidden">
      {/* Dithering background matching the rest of the site */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute inset-0" style={{ 
          filter: 'blur(6px)', 
          opacity: 0.6,
          transform: 'scale(1.1)'
        }}>
          <Dither
            waveColor={[0.6, 0.15, 0.15]} // Red and black only, no white
            disableAnimation={false}
            enableMouseInteraction={false}
            mouseRadius={0.3}
            colorNum={3} // Less colors to avoid white
            waveAmplitude={0.35}
            waveFrequency={3.0}
            waveSpeed={0.01}
            pixelSize={2} // Same small grain as everywhere else
          />
        </div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className=""
          >
            <NeonText variant="red" size="xl" className="mb-8">контакты</NeonText>
            <div className="space-y-3">
              <a
                href="https://yandex.ru/maps/-/CHDQRW0Z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 hover:text-red-400 transition-colors group"
              >
                <MapPin size={16} style={{ color: colors.neon.red }} className="mt-0.5 flex-shrink-0" />
                <span className="underline transition-colors hover:opacity-80">Конюшенная площадь 2B, Санкт-Петербург</span>
              </a>
              <div className="flex items-center space-x-3">
                <Phone size={16} style={{ color: colors.neon.red }} className="flex-shrink-0" />
                <span>+7 (921) 410-44-40</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={16} style={{ color: colors.neon.red }} className="flex-shrink-0" />
                <span>Пт-Сб: 23:00-06:00</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className=""
          >
            <NeonText variant="red" size="xl" className="mb-8">быстрые ссылки</NeonText>
            <div className="space-y-3">
              <a href="/events" className="block transition-colors hover:opacity-80">Афиша</a>
              <a href="/gallery" className="block transition-colors hover:opacity-80">Галерея</a>
              <a href="/rules" className="block transition-colors hover:opacity-80">Правила</a>
              <a href="/reservations" className="block transition-colors hover:opacity-80">Бронирование</a>
              <a href="/contact" className="block transition-colors hover:opacity-80">Контакты</a>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className=""
          >
            <NeonText variant="red" size="xl" className="mb-8">социальные сети</NeonText>
            <div className="grid grid-cols-4 gap-3 max-w-[240px]">
              <a 
                href="https://vk.com/vnvnc_spb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
                style={{ 
                  backgroundColor: colors.glass.white
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.neon.red}33`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${colors.neon.red}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.glass.white;
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <FaVk size={24} className="text-white" />
              </a>
              <a 
                href="https://instagram.com/vnvnc_spb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
                style={{ 
                  backgroundColor: colors.glass.white
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.neon.red}33`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${colors.neon.red}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.glass.white;
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <FaInstagram size={24} className="text-white" />
              </a>
              <a 
                href="https://t.me/vnvnc_spb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
                style={{ 
                  backgroundColor: colors.glass.white
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.neon.red}33`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${colors.neon.red}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.glass.white;
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <FaTelegram size={24} className="text-white" />
              </a>
              <a 
                href="https://t.me/vnvncbattlebot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
                style={{ 
                  backgroundColor: colors.glass.white
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.neon.red}33`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${colors.neon.red}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.glass.white;
                  e.currentTarget.style.boxShadow = '';
                }}
                title="Battle Bot"
              >
                <Bot size={24} className="text-white" />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/60 flex items-center justify-center gap-2">
            <span>© {new Date().getFullYear()}</span>
            <span className="inline-flex items-center overflow-visible"><WarpedVNVNC height={16} animated /></span>
            <span>. Официальный сайт.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
