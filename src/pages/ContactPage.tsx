import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Navigation, Send, MessageSquare } from 'lucide-react'
import { FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { useEffect, useRef, useState } from 'react'
import { colors } from '../utils/colors'
import Button from '../components/ui/Button'
import NeonText from '../components/ui/NeonText'
// Убрали DitherBackground
import { api } from '../services/api'
import BackButton from '../components/BackButton'

const ContactPage = () => {
  const yandexMapRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const result = await api.submitContact(formData)
      
      if (result.success) {
        // Reset form
        setFormData({ name: '', phone: '', message: '' })
        
        // Show success message
        alert('Спасибо! Мы свяжемся с вами в ближайшее время.')
      } else {
        throw new Error('Failed to submit contact form')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      alert('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз или позвоните нам.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen pt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <BackButton to="/" text="на главную" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold text-white mb-6 lowercase text-stretch-heading break-words">
            контакты <NeonText variant="red" size="3xl" glow className="inline-block">vnvnc</NeonText>
          </h1>
          <p className="text-base sm:text-lg text-white/70 lowercase text-stretch-body">свяжитесь с нами для бронирования и вопросов</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="backdrop-blur-lg rounded-2xl p-8 border border-white/10"
                 style={{ backgroundColor: colors.glass.dark }}>
              <h2 className="text-2xl font-bold text-white mb-6">Контактная информация</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin style={{ color: colors.neon.red }} size={24} className="mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Адрес</h3>
                    <a 
                      href="https://yandex.ru/maps/-/CHDQRW0Z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white transition-colors underline"
                    >
                      Конюшенная площадь 2B, Санкт-Петербург
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone style={{ color: colors.neon.red }} size={24} className="mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Телефон</h3>
                    <a href="tel:+79214104440" className="text-white/80 hover:text-white transition-colors">
                      +7 (921) 410-44-40
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock style={{ color: colors.neon.red }} size={24} className="mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Время работы</h3>
                    <p className="text-white/80">Пятница - Суббота: 23:00 - 06:00</p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-white mb-4">Быстрая связь</h3>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://t.me/vnvncbattlebot"
                    target="_blank"
                    rel="noopener noreferrer"
                     className="flex items-center justify-center gap-2 p-3 rounded-[12px] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                    style={{ backgroundColor: colors.glass.white }}
                  >
                    <FaTelegram size={20} />
                    <span>Telegram</span>
                  </a>
                  <a
                    href="https://wa.me/79214104440"
                    target="_blank"
                    rel="noopener noreferrer"
                     className="flex items-center justify-center gap-2 p-3 rounded-[12px] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                    style={{ backgroundColor: colors.glass.white }}
                  >
                    <FaWhatsapp size={20} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Yandex Map */}
            <div className="backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10"
                 style={{ backgroundColor: colors.glass.dark }}>
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <Navigation style={{ color: colors.neon.red }} size={20} />
                  <h3 className="text-lg font-semibold text-white">Как до нас добраться</h3>
                </div>
                <p className="text-white/60 text-sm mt-1">Конюшенная площадь 2B, Санкт-Петербург</p>
              </div>
              <div ref={yandexMapRef} className="w-full h-96" />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            style={{ backgroundColor: colors.glass.dark }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare style={{ color: colors.neon.red }} />
              Свяжитесь с нами
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.glass.white,
                    '--tw-ring-color': `${colors.neon.red}66`
                  } as any}
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.glass.white,
                    '--tw-ring-color': `${colors.neon.red}66`
                  } as any}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Сообщение
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300 resize-none"
                  style={{ 
                    backgroundColor: colors.glass.white,
                    '--tw-ring-color': `${colors.neon.red}66`
                  } as any}
                  placeholder="Ваше сообщение..."
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
                disabled={isSubmitting}
                glow
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Отправка...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send size={18} />
                    Отправить сообщение
                  </span>
                )}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 p-4 rounded-lg backdrop-blur-sm border border-white/10"
                 style={{ backgroundColor: colors.glass.white }}>
              <h3 className="font-semibold text-white mb-2">Важная информация</h3>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Бронирование столов через <a href="/reservations" className="underline hover:text-white transition-colors">форму</a> или по телефону +7 (921) 410-44-40</li>
                <li>• VIP-вход без очереди для гостей с бронью</li>
                <li>• Депозит: 10% — сервисный сбор, 90% — на бар и кухню</li>
                <li>• Отмена брони возможна за 3 часа до мероприятия</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage