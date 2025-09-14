import { MapPin, Phone, Clock, Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import { FaTelegram, FaInstagram, FaVk } from 'react-icons/fa'
import NeonText from './ui/NeonText'
import { colors } from '../utils/colors'
import NewsTicker from './ui/NewsTicker'
// Убрали Dither для лёгкости
// import WarpedVNVNC from './logo/WarpedVNVNC'

const Footer = () => {
  return (
    <footer className="relative bg-black border-t border-white/10 text-white overflow-hidden">
      <div className="py-0 border-b border-white/10">
        <div className="relative overflow-hidden" style={{ background: `linear-gradient(90deg, ${colors.neon.red}, #b30000)` }}>
          <NewsTicker className="text-[11px] sm:text-sm tracking-[0.15em] uppercase text-white py-2" speedMs={52000} />
        </div>
      </div>
      {/* Лёгкий градиент без анимации */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(1200px 600px at 80% 20%, ${colors.neon.red}12, transparent)`,
      }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className=""
          >
            <NeonText variant="red" size="xl" className="mb-6">контакты</NeonText>
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
              <a 
                href="tel:+79214104440"
                className="flex items-center space-x-3 hover:text-red-400 transition-colors"
              >
                <Phone size={16} style={{ color: colors.neon.red }} className="flex-shrink-0" />
                <span className="underline transition-colors hover:opacity-80">+7 (921) 410-44-40</span>
              </a>
              <div className="flex items-center space-x-3">
                <Clock size={16} style={{ color: colors.neon.red }} className="flex-shrink-0" />
                <span>Пт-Вс: 23:00-07:00</span>
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
            <NeonText variant="red" size="xl" className="mb-6">быстрые ссылки</NeonText>
            <div className="space-y-2.5">
              <a href="/events" className="block transition-colors hover:opacity-80">афиша</a>
              <a href="/gallery" className="block transition-colors hover:opacity-80">галерея</a>
              <a href="/rules" className="block transition-colors hover:opacity-80">правила</a>
              <a href="/reservations" className="block transition-colors hover:opacity-80">бронирование</a>
              <a href="/rental" className="block transition-colors hover:opacity-80">аренда клуба</a>
              <a href="/contact" className="block transition-colors hover:opacity-80">контакты</a>
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
          <p className="text-white/70 flex items-center justify-center gap-2">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-display font-extrabold lowercase" style={{ color: colors.neon.red }}>vnvnc</span>
            <span>· официальный сайт</span>
          </p>
          <p className="text-white/50 text-sm mt-2">Все права защищены</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
