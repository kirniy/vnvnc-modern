import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ArrowLeft, ShoppingCart, Maximize2, Clock, MapPin, Share2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { ticketsCloudService } from '../services/ticketsCloud'
import { colors } from '../utils/colors'
import CountdownTimer from '../components/CountdownTimer'
import Sticker from '../components/ui/Sticker'
// Убрали DitherBackground

interface EventDetailPageProps {
  eventIdOverride?: string
}

const EventDetailPage = ({ eventIdOverride }: EventDetailPageProps = {}) => {
  const { id } = useParams<{ id: string }>()
  const eventId = eventIdOverride || id  // Use override if provided, otherwise use URL param
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [showShareTooltip, setShowShareTooltip] = useState(false)

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      return await ticketsCloudService.getEventDetails(eventId || '')
    },
  })
  
  // Handle share functionality
  const handleShare = async () => {
    if (!event) return
    
    const baseUrl = window.location.origin
    
    // Extract date from event.rawDate which is more reliable
    let dateSlug = ''
    if (event.rawDate) {
      const eventDate = new Date(event.rawDate)
      // Use Moscow timezone to get the correct date
      const formatter = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
      const parts = formatter.formatToParts(eventDate)
      const day = parts.find(p => p.type === 'day')?.value || ''
      const month = parts.find(p => p.type === 'month')?.value || ''
      const year = parts.find(p => p.type === 'year')?.value || ''
      dateSlug = `${day}-${month}-${year}`
    }
    
    // Create short URL in format: /e/02-08-25
    const shortUrl = dateSlug 
      ? `${baseUrl}/e/${dateSlug}`
      : `${baseUrl}/e/${id?.substring(0, 8)}`
    
    try {
      await navigator.clipboard.writeText(shortUrl)
      setShowShareTooltip(true)
      setTimeout(() => setShowShareTooltip(false), 2000)
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shortUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowShareTooltip(true)
      setTimeout(() => setShowShareTooltip(false), 2000)
    }
  }
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-red-600 opacity-20"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Мероприятие не найдено</h1>
          <Link to="/events" className="text-red-500 hover:text-red-400">
            ← Вернуться к афише
          </Link>
        </div>
      </div>
    )
  }

  // Clean up description for meta tags
  const cleanDescription = event.description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .substring(0, 160); // Limit to 160 characters for meta description

  return (
    <div className="min-h-screen relative">
      <Helmet>
        <title>{event.title} | VNVNC Concert Hall</title>
        <meta name="description" content={`${event.title} - ${event.date}. ${cleanDescription}`} />
        
        {/* Open Graph tags for social media */}
        <meta property="og:title" content={`${event.title} | VNVNC`} />
        <meta property="og:description" content={`${event.date} в VNVNC Concert Hall. ${cleanDescription}`} />
        <meta property="og:image" content={event.poster_original || event.image} />
        <meta property="og:type" content="event" />
        <meta property="og:site_name" content="VNVNC Concert Hall" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${event.title} | VNVNC`} />
        <meta name="twitter:description" content={`${event.date} в VNVNC Concert Hall. ${cleanDescription}`} />
        <meta name="twitter:image" content={event.poster_original || event.image} />
      </Helmet>

      {/* Content wrapper with higher z-index */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative h-96 overflow-visible">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <Link
              to="/events"
              className="inline-flex items-center space-x-2 text-white hover:text-red-500 mb-4"
            >
              <ArrowLeft size={20} />
              <span>Назад к афише</span>
            </Link>
            
            <div className="flex items-end justify-between gap-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-display font-extrabold text-white flex-1 text-stretch-y-120 lowercase"
              >
                {event.title}
              </motion.h1>
              {event.age_rating && (
                <div className="hidden md:block">
                  <Sticker size="md" color="red" className="-rotate-3">{event.age_rating}+ </Sticker>
                </div>
              )}
              
              {/* Share Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-3 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 group"
                  style={{ 
                    backgroundColor: colors.glass.white,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.3)`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.glass.whiteHover
                    e.currentTarget.style.borderColor = colors.neon.red + '44'
                    e.currentTarget.style.boxShadow = `0 6px 30px ${colors.neon.red}33`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.glass.white
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`
                  }}
                >
                  <Share2 size={24} className="text-white group-hover:text-red-400 transition-colors" />
                </motion.button>
                
                {/* Tooltip */}
                <AnimatePresence>
                  {showShareTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 right-0 px-3 py-2 rounded-lg backdrop-blur-md border border-white/20 whitespace-nowrap z-50"
                      style={{ 
                        backgroundColor: colors.glass.dark,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                    >
                      <span className="text-white text-sm">Ссылка скопирована!</span>
                      <div 
                        className="absolute -top-1 right-4 w-2 h-2 rotate-45 border-t border-l border-white/20"
                        style={{ backgroundColor: colors.glass.dark }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* About Event with Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/10"
            style={{ backgroundColor: colors.glass.dark }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">О мероприятии</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Description */}
              <div className="order-2 md:order-1 space-y-6">
                <p className="text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description }} />
                
                {/* CTA: outline brat-style, без тяжёлых эффектов */}
                <motion.a 
                  href="#"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="ticketscloud-widget inline-flex items-center gap-3 px-8 py-4 radius font-display font-extrabold tracking-wide text-lg border-2 border-white text-white bg-transparent transition-colors duration-150 hover:bg-white hover:text-black"
                  data-tc-event={event.id}
                  data-tc-token={import.meta.env.VITE_TC_WIDGET_TOKEN}
                  data-tc-lang="ru"
                  data-tc-mini="1"
                  data-tc-style="1"
                >
                  <ShoppingCart size={22} />
                  тикеты
                  {event.price && (
                    <span className="ml-2 px-3 py-1 rounded-md text-sm border border-white/20">
                      {event.price}
                    </span>
                  )}
                </motion.a>
              </div>
              
              {/* Poster - scaled to match description height */}
              <div className="order-1 md:order-2 flex items-start">
                <div className="w-full max-w-md mx-auto">
                  <div 
                    className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-auto rounded-2xl transition-all duration-500 group-hover:scale-105"
                      style={{ maxHeight: '500px', objectFit: 'contain', backgroundColor: colors.glass.darker }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="p-3 rounded-full backdrop-blur-md" style={{ backgroundColor: colors.glass.white }}>
                        <Maximize2 size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                         style={{ 
                           boxShadow: `0 0 30px ${colors.neon.red}44, inset 0 0 30px ${colors.neon.red}22`
                         }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info and Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-lg rounded-3xl p-8 border border-white/10 relative overflow-hidden"
            style={{ backgroundColor: colors.glass.dark }}
          >
            {/* лёгкий фон без анимации */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                 style={{ background: `radial-gradient(1200px 600px at 100% 0%, ${colors.neon.red}22, transparent)` }} />
            
            <h3 className="text-2xl font-bold text-white mb-8 relative">Информация о мероприятии</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Event Info */}
              <div className="space-y-6">
                <div className="group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:border-red-500/30 transition-colors"
                         style={{ backgroundColor: colors.glass.darker }}>
                      <Calendar className="text-red-500" size={24} />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Дата</p>
                      <p className="text-white text-lg font-medium">{event.date}</p>
                      {event.rawDate && (
                        <p className="text-red-400 text-sm mt-1 font-medium">
                          {(() => {
                            const moscowDate = new Date(event.rawDate).toLocaleDateString('ru-RU', {
                              weekday: 'long',
                              timeZone: 'Europe/Moscow'
                            });
                            return moscowDate.charAt(0).toUpperCase() + moscowDate.slice(1);
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {event.time && (
                  <div className="group">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:border-red-500/30 transition-colors"
                           style={{ backgroundColor: colors.glass.darker }}>
                        <Clock className="text-red-500" size={24} />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Время</p>
                        <p className="text-white text-lg font-medium">{event.time}</p>
                      </div>
                    </div>
                  </div>
                )}
                {event.location && (
                  <div className="group">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:border-red-500/30 transition-colors"
                           style={{ backgroundColor: colors.glass.darker }}>
                        <MapPin className="text-red-500" size={24} />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Место</p>
                        <p className="text-white text-lg font-medium">{event.location}</p>
                      </div>
                    </div>
                  </div>
                )}
                {event.age_rating && (
                  <div className="group">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:border-red-500/30 transition-colors"
                           style={{ backgroundColor: colors.glass.darker }}>
                        <span className="text-red-500 text-xl font-bold">{event.age_rating}+</span>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Возрастное ограничение</p>
                        <p className="text-white text-lg font-medium">Для лиц старше {event.age_rating} лет</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Countdown Timer */}
                {event.rawDate && new Date(event.rawDate) > new Date() && (
                  <div className="group mt-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:border-red-500/30 transition-colors"
                           style={{ backgroundColor: colors.glass.darker }}>
                        <Clock className="text-red-500 animate-pulse" size={24} />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-2">До начала события</p>
                        <CountdownTimer targetDate={new Date(event.rawDate)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* CTA справа: outline без анимаций */}
              <div className="flex items-start md:justify-end">
                <motion.a 
                  href="#"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="ticketscloud-widget px-8 py-4 radius font-display font-extrabold tracking-wide text-lg border-2 border-white text-white bg-transparent transition-colors duration-150 hover:bg-white hover:text-black flex items-center gap-3"
                  data-tc-event={event.id}
                  data-tc-token={import.meta.env.VITE_TC_WIDGET_TOKEN}
                  data-tc-lang="ru"
                  data-tc-mini="1"
                  data-tc-style="1"
                >
                  <ShoppingCart size={22} />
                  тикеты
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: event.image }]}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
        }}
      />
      </div>
    </div>
  )
}

export default EventDetailPage