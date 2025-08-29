import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Sparkles, ChevronRight, Phone, MessageSquare, Check, X, ZoomIn } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ru } from 'date-fns/locale/ru'

// Register Russian locale
registerLocale('ru', ru)
import { colors } from '../utils/colors'
import Button from '../components/ui/Button'
import NeonText from '../components/ui/NeonText'
import Accordion from '../components/ui/Accordion'
// Убрали DitherBackground
import { api } from '../services/api'

const ReservationsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    guests: '4',
    tableType: 'table3',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTable, setSelectedTable] = useState('table3')
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  
  // Phone formatter that allows international numbers
  const formatPhone = (value: string) => {
    // Keep the + sign and digits
    const cleaned = value.replace(/[^\d+]/g, '')
    
    // If empty, return empty
    if (cleaned.length === 0) return ''
    
    // If it starts with +7 or 8, format as Russian number
    if (cleaned.startsWith('+7') || cleaned.startsWith('7') || cleaned.startsWith('8')) {
      const digits = cleaned.replace(/\+/g, '')
      let res = '+7'
      const src = digits.startsWith('7') ? digits.slice(1) : digits.startsWith('8') ? digits.slice(1) : digits
      
      if (src.length > 0) res += ' (' + src.slice(0, 3)
      if (src.length >= 3) res += ') '
      if (src.length >= 4) res += src.slice(3, 6)
      if (src.length >= 6) res += '-' + src.slice(6, 8)
      if (src.length >= 8) res += '-' + src.slice(8, 10)
      
      return res
    }
    
    // For international numbers, just return cleaned version with spaces
    return cleaned
  }

  const tableTypes = [
    {
      id: 'table2',
      name: 'Стол на 2 человека',
      tableNumbers: 'Уточняется',
      capacity: '2 человека',
      price: 7000,
      deposit: 1000,
      depositLabel: 'Депозит',
      prepaymentLabel: 'Предоплата',
      features: [],
      popular: false
    },
    {
      id: 'table3',
      name: 'Стол на 3 человека',
      tableNumbers: '№3, 7, 6',
      capacity: '3 человека',
      price: 10500,
      deposit: 1000,
      depositLabel: 'Депозит',
      prepaymentLabel: 'Предоплата',
      features: [],
      popular: false
    },
    {
      id: 'table4-5',
      name: 'Стол на 4-5 человек',
      tableNumbers: '№1, 2, 4, 5, 8, 9',
      capacity: '4-5 человек',
      price: 14000,
      pricePrefix: 'от',
      deposit: 2000,
      depositLabel: 'Депозит',
      prepaymentLabel: 'Предоплата',
      features: [],
      popular: false
    },
    {
      id: 'vip',
      name: 'VIP ложа',
      tableNumbers: '№10',
      capacity: '10-14 человек',
      price: 35000,
      pricePrefix: 'от',
      deposit: 5000,
      depositLabel: 'Депозит',
      prepaymentLabel: 'Предоплата',
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
      answer: 'Депозит включает: 10% — сервисный сбор, 90% — на бар и кухню. Welcome set стоимостью 1000 ₽ уже включен в депозит.'
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
          tableType: 'table3',
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
      [name]: name === 'phone' ? formatPhone(value) : value
    }))
    if (name === 'tableType') {
      setSelectedTable(value)
    }
  }

  // Get tomorrow's date as minimum

  return (
    <div className="min-h-screen pt-20 pb-8 sm:pb-0 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-safe relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-2 lowercase text-stretch-heading">
            бронирование <NeonText variant="red" size="5xl" glow className="inline-block">столов</NeonText>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto lowercase text-stretch-body">забронируйте лучшие места в клубе с VIP‑входом без очереди</p>
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
            className="flex items-center gap-2 px-6 py-3 rounded-[12px] backdrop-blur-sm border border-white/10 text-white hover:border-white/20 transition-all duration-300"
            style={{ backgroundColor: colors.glass.dark }}
          >
            <Phone size={20} />
            <span>Позвонить</span>
          </a>
          <a
            href="https://wa.me/79214104440"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-[12px] backdrop-blur-sm border border-white/10 text-white hover:border-white/20 transition-all duration-300"
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
            
            {/* Map Preview */}
            <div 
              className="mb-6 p-3 backdrop-blur-lg rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-all"
              style={{ backgroundColor: colors.glass.darker }}
              onClick={() => setIsMapModalOpen(true)}
            >
              <div className="relative">
                <img 
                  src="/map.jpeg" 
                  alt="Схема зала VNVNC" 
                  className="w-full h-auto rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                  style={{ maxHeight: '180px', objectFit: 'cover', objectPosition: 'center' }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg hover:bg-black/20 transition-colors">
                  <div className="text-center">
                    <ZoomIn size={32} className="text-white mb-2 mx-auto" />
                    <p className="text-white text-sm font-medium">Посмотреть схему зала</p>
                  </div>
                </div>
              </div>
            </div>
            
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
                      {table.tableNumbers && (
                        <p className="text-sm text-white/80 mb-1">{table.tableNumbers}</p>
                      )}
                      <p className="text-white/60 flex items-center gap-1">
                        <Users size={16} />
                        {table.capacity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: colors.neon.red }}>
                        {(table as any).pricePrefix && <span className="text-lg">{(table as any).pricePrefix} </span>}
                        {table.price.toLocaleString()}₽
                      </p>
                      <p className="text-sm text-white/80">{(table as any).depositLabel} {(table as any).pricePrefix && <span>{(table as any).pricePrefix} </span>}{table.price.toLocaleString()}₽</p>
                      <p className="text-sm text-white/60">{(table as any).prepaymentLabel} {table.deposit.toLocaleString()}₽</p>
                    </div>
                  </div>
                  
                  {table.features.length > 0 && (
                    <div className="space-y-2">
                      {table.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-white/80">
                          <Check size={16} style={{ color: colors.neon.red }} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

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
            
            <form id="reservation-form" onSubmit={handleSubmit} className="space-y-6">
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
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Дата
                  </label>
                  <DatePicker
                    selected={formData.date ? new Date(formData.date) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setFormData(prev => ({ ...prev, date: `${year}-${month}-${day}` }))
                      }
                    }}
                    locale="ru"
                    dateFormat="dd.MM.yyyy"
                    minDate={new Date()}
                    placeholderText="Выберите дату"
                    className="w-full px-4 py-3 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:outline-none transition-all duration-300"
                    wrapperClassName="w-full"
                    calendarClassName="vnvnc-calendar"
                    required
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
                      '--tw-ring-color': `${colors.neon.red}66`,
                      minHeight: '48px'
                    } as any}
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(num => {
                      // Proper Russian pluralization
                      let text = num + ' '
                      if (num === 1) {
                        text += 'человек'
                      } else if (num >= 2 && num <= 4) {
                        text += 'человека'
                      } else {
                        text += 'человек'
                      }
                      return (
                        <option key={num} value={num} className="bg-black">
                          {text}
                        </option>
                      )
                    })}
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
                    {(tableTypes.find(t => t.id === formData.tableType) as any)?.pricePrefix && (
                      <span className="text-lg">{(tableTypes.find(t => t.id === formData.tableType) as any)?.pricePrefix} </span>
                    )}
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

            {/* VIP Benefits */}
            <div className="mt-6 rounded-xl p-5 border"
              style={{
                backgroundColor: colors.glass.darker,
                borderColor: colors.neon.red + '33'
              }}
            >
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
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
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 sm:mt-16"
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
          className="mt-8 mb-8 text-center"
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
      
      {/* Map Modal */}
      <AnimatePresence>
        {isMapModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMapModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] overflow-auto rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>
              <img 
                src="/map.jpeg" 
                alt="Схема зала VNVNC" 
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                <p className="text-white text-center">Схема зала VNVNC</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReservationsPage