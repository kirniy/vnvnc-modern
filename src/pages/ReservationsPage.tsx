import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Sparkles, ChevronRight, Phone, MessageSquare, Check } from 'lucide-react'
import { FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { colors } from '../utils/colors'
import Button from '../components/ui/Button'
import NeonText from '../components/ui/NeonText'
import Accordion from '../components/ui/Accordion'
import DitherBackground from '../components/DitherBackground'
import { api } from '../services/api'

const ReservationsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    guests: '4',
    tableType: 'standard',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTable, setSelectedTable] = useState('standard')

  const tableTypes = [
    {
      id: 'standard',
      name: 'Стандартный стол',
      capacity: '3-4 человека',
      price: 14000,
      deposit: 1000,
      features: ['Идеальное расположение', 'Вид на танцпол', 'Быстрое обслуживание'],
      popular: false
    },
    {
      id: 'comfort',
      name: 'Комфорт зона',
      capacity: '5-6 человек',
      price: 21000,
      deposit: 2000,
      features: ['Уютная атмосфера', 'Мягкие диваны', 'Приватность'],
      popular: true
    },
    {
      id: 'vip',
      name: 'VIP ложа',
      capacity: '10-14 человек',
      price: 35000,
      deposit: 5000,
      features: ['Эксклюзивная зона', 'Персональный официант', 'Лучший вид', 'Премиум сервис'],
      popular: false
    }
  ]

  const faqItems = [
    {
      id: '1',
      question: 'Как работает система бронирования?',
      answer: 'Вы оставляете заявку, мы связываемся с вами для подтверждения в течение 30 минут. После подтверждения вносится депозит, который вы можете потратить на барную карту.'
    },
    {
      id: '2',
      question: 'Можно ли отменить бронь?',
      answer: 'Да, бронь можно отменить за 3 часа до мероприятия с полным возвратом депозита. При отмене позже депозит не возвращается.'
    },
    {
      id: '3',
      question: 'Что входит в депозит?',
      answer: 'Депозит можно потратить на любые позиции из барной карты и меню кухни. Сервисный сбор 10% уже включен в сумму депозита.'
    },
    {
      id: '4',
      question: 'Какие привилегии у гостей с бронью?',
      answer: 'VIP-вход без очереди, приоритетное обслуживание, возможность заказа за час до прихода, специальные предложения от бара.'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const result = await api.submitBooking(formData)
      
      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          phone: '',
          date: '',
          guests: '4',
          tableType: 'standard',
          message: ''
        })
        
        // Show success message
        alert('Спасибо! Мы свяжемся с вами в течение 30 минут для подтверждения брони.')
      } else {
        throw new Error('Failed to submit booking')
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз или позвоните нам.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (name === 'tableType') {
      setSelectedTable(value)
    }
  }

  // Get tomorrow's date as minimum
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="min-h-screen pt-20 relative">
      <DitherBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Бронирование <NeonText variant="red" size="5xl" glow>столов</NeonText>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Забронируйте лучшие места в клубе с VIP-входом без очереди
          </p>
        </motion.div>

        {/* Quick Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <a
            href="tel:+79214104440"
            className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10 text-white hover:border-white/20 transition-all duration-300"
            style={{ backgroundColor: colors.glass.dark }}
          >
            <Phone size={20} />
            <span>Позвонить</span>
          </a>
          <a
            href="https://t.me/vnvnc_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-sm border text-white transition-all duration-300"
            style={{ 
              backgroundColor: colors.glass.dark,
              borderColor: colors.neon.red + '66'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.neon.red
              e.currentTarget.style.boxShadow = `0 0 20px ${colors.neon.red}66`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.neon.red + '66'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <FaTelegram size={20} />
            <span>Telegram бот</span>
          </a>
          <a
            href="https://wa.me/79214104440"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10 text-white hover:border-white/20 transition-all duration-300"
            style={{ backgroundColor: colors.glass.dark }}
          >
            <FaWhatsapp size={20} />
            <span>WhatsApp</span>
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Table Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles style={{ color: colors.neon.red }} />
              Выберите тип стола
            </h2>
            
            <div className="space-y-4">
              {tableTypes.map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tableType: table.id }))
                    setSelectedTable(table.id)
                  }}
                  className={`relative rounded-3xl p-6 cursor-pointer transition-all duration-300 ${
                    selectedTable === table.id ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: colors.glass.dark,
                    border: selectedTable === table.id ? `2px solid ${colors.neon.red}` : '2px solid transparent',
                    boxShadow: selectedTable === table.id ? `0 0 30px ${colors.neon.red}44` : 'none'
                  }}
                >
                  {table.popular && (
                    <div 
                      className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-black"
                      style={{ backgroundColor: colors.neon.red }}
                    >
                      Популярно
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{table.name}</h3>
                      <p className="text-white/60 flex items-center gap-1">
                        <Users size={16} />
                        {table.capacity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: colors.neon.red }}>
                        {table.price.toLocaleString()}₽
                      </p>
                      <p className="text-sm text-white/60">депозит {table.deposit}₽</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {table.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/80">
                        <Check size={16} style={{ color: colors.neon.red }} />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* VIP Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-3xl p-6 border"
              style={{
                backgroundColor: colors.glass.darker,
                borderColor: colors.neon.red + '33'
              }}
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={20} style={{ color: colors.neon.red }} />
                Привилегии для гостей с бронью
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'VIP-вход без очереди',
                  'Приоритетное обслуживание',
                  'Специальные предложения',
                  'Заказ за час до прихода'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight size={16} style={{ color: colors.neon.red }} className="mt-0.5" />
                    <span className="text-sm text-white/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Reservation Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-lg rounded-3xl p-8 border border-white/10"
            style={{ backgroundColor: colors.glass.dark }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar style={{ color: colors.neon.red }} />
              Оформить бронь
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300"
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
                    className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300"
                    style={{ 
                      backgroundColor: colors.glass.white,
                      '--tw-ring-color': `${colors.neon.red}66`
                    } as any}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Дата
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={minDate}
                    className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300"
                    style={{ 
                      backgroundColor: colors.glass.white,
                      '--tw-ring-color': `${colors.neon.red}66`,
                      colorScheme: 'dark'
                    } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Количество гостей
                  </label>
                  <select 
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:ring-2 focus:outline-none transition-all duration-300"
                    style={{ 
                      backgroundColor: colors.glass.white,
                      '--tw-ring-color': `${colors.neon.red}66`
                    } as any}
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(num => (
                      <option key={num} value={num} className="bg-black">{num} человек</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Пожелания
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300 resize-none"
                  style={{ 
                    backgroundColor: colors.glass.white,
                    '--tw-ring-color': `${colors.neon.red}66`
                  } as any}
                  placeholder="Особые пожелания к столу..."
                />
              </div>

              <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: colors.glass.darker }}>
                <h4 className="font-semibold text-white mb-2">Выбранный стол</h4>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">
                    {tableTypes.find(t => t.id === formData.tableType)?.name}
                  </span>
                  <span className="text-xl font-bold" style={{ color: colors.neon.red }}>
                    {tableTypes.find(t => t.id === formData.tableType)?.price.toLocaleString()}₽
                  </span>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                className="w-full"
                disabled={isSubmitting}
                glow
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Оформляем бронь...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Calendar size={20} />
                    Забронировать стол
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Часто задаваемые <NeonText variant="red" size="3xl" glow>вопросы</NeonText>
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion items={faqItems} />
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 text-white/60">
            <MessageSquare size={20} />
            <span>Остались вопросы?</span>
            <a 
              href="tel:+79214104440" 
              className="font-semibold hover:text-white transition-colors"
              style={{ color: colors.neon.red }}
            >
              +7 (921) 410-44-40
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReservationsPage