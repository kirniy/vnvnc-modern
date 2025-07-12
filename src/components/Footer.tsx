import { MapPin, Phone, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-primary-500">Контакты</h3>
            <div className="space-y-2">
              <a
                href="https://yandex.ru/maps/-/CHDQRW0Z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-red-400 transition-colors"
              >
                <MapPin size={16} className="text-red-500" />
                <span className="underline">Конюшенная площадь 2B, Санкт-Петербург</span>
              </a>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-primary-500" />
                <span>+7 (921) 410-44-40</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-primary-500" />
                <span>Пт-Сб: 23:00-06:00</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-primary-500">Быстрые ссылки</h3>
            <div className="space-y-2">
              <a href="/events" className="block hover:text-primary-500 transition-colors">Афиша</a>
              <a href="/gallery" className="block hover:text-primary-500 transition-colors">Галерея</a>
              <a href="/reservations" className="block hover:text-primary-500 transition-colors">Бронирование</a>
              <a href="/contact" className="block hover:text-primary-500 transition-colors">Контакты</a>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-primary-500">Социальные сети</h3>
            <div className="flex space-x-4">
              <a 
                href="https://vk.com/vnvnc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-500 transition-colors"
              >
                VK
              </a>
              <a 
                href="https://www.instagram.com/vnvnc_concerthall/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-500 transition-colors"
              >
                Instagram
              </a>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © 2024 VNVNC. Официальный сайт.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
