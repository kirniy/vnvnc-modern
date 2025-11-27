import { MapPin, Phone, Clock, Bot, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { FaTelegram, FaInstagram, FaVk } from 'react-icons/fa'

import { colors } from '../utils/colors'
import NewsTicker from './ui/NewsTicker'

const Footer = () => {
  const socialLinks = [
    { icon: FaVk, href: 'https://vk.com/vnvnc_spb', label: 'VK' },
    { icon: FaInstagram, href: 'https://instagram.com/vnvnc_spb', label: 'Instagram' },
    { icon: FaTelegram, href: 'https://t.me/vnvnc_spb', label: 'Telegram' },
    { icon: Bot, href: 'https://t.me/vnvncbattlebot', label: 'Battle Bot' },
  ]

  const quickLinks = [
    { name: 'афиша', path: '/events' },
    { name: 'галерея', path: '/gallery' },
    { name: 'правила', path: '/rules' },
    { name: 'бронирование', path: '/reservations' },
    { name: 'аренда клуба', path: '/rental' },
    { name: 'мерч', path: '/merch' },
    { name: 'контакты', path: '/contact' },
  ]

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Top Glowing Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-50 blur-[2px] z-20" />

      {/* Running Line Section */}
      <div className="relative border-b border-white/5 bg-black/50 backdrop-blur-sm z-10">
        <div className="py-3 opacity-90">
          <NewsTicker className="text-xs sm:text-sm font-display font-bold tracking-[0.2em] uppercase text-white" speedMs={45000} />
        </div>
      </div>

      {/* Ambient Background Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 100%, ${colors.neon.red}15 0%, transparent 70%)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Column 1: Contact Info (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5 space-y-8"
          >
            <div>
              <h3 className="font-display font-extrabold text-2xl mb-6 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">контакты</span>
              </h3>

              <div className="space-y-6 font-light text-white/80">
                <a
                  href="https://yandex.ru/maps/-/CHDQRW0Z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 transition-all duration-300 hover:text-white"
                >
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-neon-red/50 transition-colors">
                    <MapPin size={18} className="text-neon-red" />
                  </div>
                  <span className="mt-1.5 group-hover:underline decoration-neon-red/50 underline-offset-4">
                    Конюшенная площадь 2B, Санкт-Петербург
                  </span>
                </a>

                <a
                  href="tel:+79214104440"
                  className="group flex items-center gap-4 transition-all duration-300 hover:text-white"
                >
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-neon-red/50 transition-colors">
                    <Phone size={18} className="text-neon-red" />
                  </div>
                  <span className="group-hover:underline decoration-neon-red/50 underline-offset-4">
                    +7 (921) 410-44-40
                  </span>
                </a>

                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Clock size={18} className="text-neon-red" />
                  </div>
                  <span>Пт-Вс: 23:00-07:00</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Quick Links (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3"
          >
            <h3 className="font-display font-extrabold text-2xl mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">навигация</span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300 uppercase text-sm tracking-wider font-medium">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Socials (4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4"
          >
            <h3 className="font-display font-extrabold text-2xl mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">соцсети</span>
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 hover:border-neon-red/50 hover:bg-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <social.icon size={24} className="relative z-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </a>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-neon-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h4 className="font-display font-bold text-white mb-2 relative z-10">Организуете ивент?</h4>
              <p className="text-sm text-white/60 mb-4 leading-relaxed relative z-10">
                Мы открыты для сотрудничества. Проведите свое мероприятие в VNVNC.
              </p>
              <a href="/rental" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon-red hover:text-white transition-colors relative z-10">
                Узнать условия <ArrowUpRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-mono">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-display font-black text-neon-red tracking-wider">VNVNC</span>
            <span className="hidden sm:inline">CONCERT HALL</span>
          </div>

          <div className="flex gap-6">
            <a href="/rules" className="hover:text-white transition-colors">Правила</a>
            <a href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
