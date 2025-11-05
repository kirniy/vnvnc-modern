import { motion } from 'framer-motion'
import { useState } from 'react'
import { Phone, Mail, Send, Music, Zap, Monitor, Lightbulb } from 'lucide-react'
import { colors } from '../utils/colors'
import NeonText from '../components/ui/NeonText'
import Button from '../components/ui/Button'
import { api } from '../services/api'
import BackButton from '../components/BackButton'
import { PageBackground } from '../components/PageBackground'
import Seo from '../components/Seo'

const RentalPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const result = await api.submitRental(formData)
      
      if (result.success) {
        setFormData({ name: '', phone: '', email: '' })
        alert('Спасибо! Мы свяжемся с вами в ближайшее время для обсуждения деталей аренды.')
      } else {
        throw new Error('Failed to submit rental form')
      }
    } catch (error) {
      console.error('Error submitting rental form:', error)
      alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз или позвоните нам.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 relative">
      <PageBackground />
      <Seo
        title="Аренда клуба VNVNC"
        description="Арендуйте площадку VNVNC для концертов, вечеринок и корпоративов. Технический райдер, условия и контакт для сотрудничества."
        canonical="https://vnvnc.ru/rental"
        keywords={[
          'аренда клуба vnvnc',
          'аренда площадки санкт-петербург',
          'концертная площадка спб',
          'ночной клуб аренда',
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-safe relative z-10">
        <BackButton to="/" text="на главную" />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold text-white mb-6 lowercase text-stretch-heading break-words">
            аренда <NeonText variant="red" size="5xl" glow className="inline-block">клуба</NeonText>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto lowercase text-stretch-body">
            проведите мероприятие в одной из лучших площадок санкт-петербурга
          </p>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-12 max-w-3xl mx-auto"
          style={{ backgroundColor: colors.glass.darker }}
        >
          <p className="text-lg text-white/90 mb-4">
            Для того, чтобы узнать условия аренды, позвоните по номеру:
          </p>
          <a 
            href="tel:+79214104440"
            className="inline-flex items-center gap-3 text-2xl font-bold text-white hover:text-opacity-80 transition-colors"
            style={{ color: colors.neon.red }}
          >
            <Phone size={28} />
            +7 (921) 410-44-40
          </a>
        </motion.div>

        {/* Tech Rider Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          <div className="backdrop-blur-lg rounded-2xl p-8 border border-white/10"
               style={{ backgroundColor: colors.glass.dark }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Music style={{ color: colors.neon.red }} />
              TECH RIDER VNVNC
            </h2>
            
            <div className="space-y-6 font-mono text-sm">
              <div>
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Zap size={16} style={{ color: colors.neon.red }} />
                  P.A. System
                </h3>
                <ul className="text-white/80 space-y-1 ml-6">
                  <li>• Top: Martin F12 x2</li>
                  <li>• Sub: Martin WLX x2</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Zap size={16} style={{ color: colors.neon.red }} />
                  AMP RACK
                </h3>
                <ul className="text-white/80 space-y-1 ml-6">
                  <li>• Processing: Xilica XP3060 x1</li>
                  <li>• POWERSOFT Q3204 x1</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Monitor size={16} style={{ color: colors.neon.red }} />
                  DJ
                </h3>
                <ul className="text-white/80 space-y-1 ml-6">
                  <li>• Pioneer CDJ 900 x2</li>
                  <li>• Pioneer DJM 700 x1</li>
                  <li>• Behringer XR-12 x1</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Lightbulb size={16} style={{ color: colors.neon.red }} />
                  LIGHT
                </h3>
                <ul className="text-white/80 space-y-1 ml-6">
                  <li>• Led Par x4</li>
                  <li>• Beam Bar RGBW x2</li>
                  <li>• MA2 on PC x1</li>
                </ul>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-white font-bold mb-2">Production Manager</h3>
                <div className="text-white/80 space-y-1">
                  <p>Спиридонов Михаил</p>
                  <a href="mailto:vnvnctech@gmail.com" className="hover:text-white transition-colors flex items-center gap-2">
                    <Mail size={14} />
                    vnvnctech@gmail.com
                  </a>
                  <a href="tel:+79643853763" className="hover:text-white transition-colors flex items-center gap-2">
                    <Phone size={14} />
                    +79643853763
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="backdrop-blur-lg rounded-2xl p-8 border border-white/10"
               style={{ backgroundColor: colors.glass.dark }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Send style={{ color: colors.neon.red }} />
              Отправить заявку
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Имя *
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
                  Телефон *
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
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.glass.white,
                    '--tw-ring-color': `${colors.neon.red}66`
                  } as any}
                  placeholder="email@example.com"
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Отправка...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send size={20} />
                    Отправить заявку
                  </span>
                )}
              </Button>

              <p className="text-xs text-white/60 text-center">
                Нажимая кнопку, вы соглашаетесь на обработку персональных данных
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RentalPage
