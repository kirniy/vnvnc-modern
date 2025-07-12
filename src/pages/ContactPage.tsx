import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Navigation } from 'lucide-react'
import { useEffect, useRef } from 'react'

const ContactPage = () => {
  const yandexMapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create script element for Yandex Maps
    const script = document.createElement('script')
    script.src = 'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3Ad3fa6ad43da65917daeaf55c3b10175767e78092b61f8e562d093841aaa0ac89&width=100%25&height=400&lang=ru_RU&scroll=true'
    script.type = 'text/javascript'
    script.charset = 'utf-8'
    script.async = true

    if (yandexMapRef.current) {
      yandexMapRef.current.appendChild(script)
    }

    return () => {
      // Cleanup script when component unmounts
      if (yandexMapRef.current && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Контакты <span className="text-red-500">VNVNC</span>
          </h1>
          <p className="text-xl text-gray-300">
            Свяжитесь с нами для бронирования и вопросов
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Контактная информация</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="text-red-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-white">Адрес</h3>
                    <a 
                      href="https://yandex.ru/maps/-/CHDQRW0Z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-red-400 transition-colors underline"
                    >
                      Конюшенная площадь 2B, Санкт-Петербург
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="text-red-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-white">Телефон</h3>
                    <p className="text-gray-300">+7 (921) 410-44-40</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="text-red-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-white">Время работы</h3>
                    <p className="text-gray-300">Пятница - Суббота: 23:00 - 06:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Yandex Map */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl h-96 overflow-hidden border border-red-500/20">
              <div className="p-4 border-b border-red-500/20">
                <div className="flex items-center space-x-2">
                  <Navigation className="text-red-500" size={20} />
                  <h3 className="text-lg font-semibold text-white">Как до нас добраться</h3>
                </div>
                <p className="text-gray-300 text-sm mt-1">Конюшенная площадь 2B, Санкт-Петербург</p>
              </div>
              <div ref={yandexMapRef} className="w-full h-full bg-black/20" />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-red-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Свяжитесь с нами</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Сообщение
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ваше сообщение..."
                />
              </div>

              <button type="submit" className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300">
                Отправить сообщение
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
