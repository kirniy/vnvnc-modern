import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ArrowLeft, ShoppingCart, Maximize2, Clock, MapPin, Share2, Camera, TriangleAlert } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { ticketsCloudService } from '../services/ticketsCloud'
import { shouldTreatAsFree } from '../config/eventsConfig'
import { trackTicketClick } from '../components/AnalyticsTracker'
import { colors } from '../utils/colors'
import { isInHalloween } from '../utils/dateHelpers'
import CountdownTimer from '../components/CountdownTimer'
import Sticker from '../components/ui/Sticker'
import { useHasPhotosForDate } from '../hooks/usePhotoDateAvailability'
import { PageBackground } from '../components/PageBackground'
import HalloweenVideoBackground from '../components/HalloweenVideoBackground'
// Убрали DitherBackground

interface EventDetailPageProps {
  eventIdOverride?: string
}

const EventDetailPage = ({ eventIdOverride }: EventDetailPageProps = {}) => {
  const { id } = useParams<{ id: string }>()
  const eventId = eventIdOverride || id  // Use override if provided, otherwise use URL param
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const navigate = useNavigate()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      return await ticketsCloudService.getEventDetails(eventId || '')
    },
  })
  // Format event date to YYYY-MM-DD for photo availability check (copied from EventCardNew)
  const eventPhotoDate = (() => {
    if (!event?.rawDate) return undefined

    const eventDate = new Date(event.rawDate)
    const moscowDate = new Date(eventDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
    const year = moscowDate.getFullYear()
    const month = (moscowDate.getMonth() + 1).toString().padStart(2, '0')
    const day = moscowDate.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
  })()

  const { hasPhotos } = useHasPhotosForDate(eventPhotoDate)
  const isHalloween = isInHalloween(event?.rawDate as any)

  // Disable raycast background (UnicornScene) on Halloween pages to avoid console spam
  useEffect(() => {
    if (isHalloween) {
      document.body.setAttribute('data-no-raycast-bg', '1')
      return () => {
        document.body.removeAttribute('data-no-raycast-bg')
      }
    }
  }, [isHalloween])

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
      if (document.body) {
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
  }
  

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 relative" {...(isHalloween ? { 'data-no-raycast-bg': '1' } as any : {})}>
      {!isHalloween && <PageBackground />}
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-red-600 opacity-20"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-20 relative" {...(isHalloween ? { 'data-no-raycast-bg': '1' } as any : {})}>
      {!isHalloween && <PageBackground />}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Мероприятие не найдено</h1>
          <Link to="/events" className="text-red-500 hover:text-red-400">
            ← Вернуться к афише
          </Link>
        </div>
      </div>
    )
  }
  const isFree = shouldTreatAsFree(event.id as any, event.rawDate as any, event.title)

  // Calculate if this is an archived event based on date
  // Events are archived the morning after they happen (6 AM cutoff)
  const now = new Date()

  // Get the event date and add 1 day + 6 hours to get the archive cutoff
  // (e.g., Sep 27 event archives on Sep 28 at 6 AM)
  let isArchived = false
  if (event.rawDate) {
    const eventDate = new Date(event.rawDate)
    const archiveCutoff = new Date(eventDate)

    // Set to next day at 6 AM Moscow time
    archiveCutoff.setDate(archiveCutoff.getDate() + 1)
    archiveCutoff.setHours(6, 0, 0, 0)

    // Convert current time to Moscow timezone for comparison
    const nowMoscow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))

    isArchived = nowMoscow > archiveCutoff
  }

  // Clean up description for meta tags
  const cleanDescription = event.description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .substring(0, 160); // Limit to 160 characters for meta description

  return (
    <div className="min-h-screen pt-20 relative" {...(isHalloween ? { 'data-no-raycast-bg': '1' } as any : {})}>
      {!isHalloween && <PageBackground />}
      {isHalloween && <HalloweenVideoBackground />}
      <Helmet>
        <title>{event.title} | VNVNC Concert Hall</title>
        <meta name="description" content={`${event.title} - ${event.date}. ${cleanDescription}`} />
        
        {/* Open Graph tags for social media */}
        <meta property="og:title" content={`${event.title} | VNVNC`} />
        <meta property="og:description" content={`${event.date} в VNVNC Concert Hall. ${cleanDescription}`} />
        <meta property="og:url" content={`https://vnvnc.ru${window.location.pathname}`} />
        <meta property="og:image" content="https://vnvnc.ru/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="VNVNC Concert Hall" />
        <meta property="og:type" content="event" />
        <meta property="og:site_name" content="VNVNC Concert Hall" />
        <meta property="og:locale" content="ru_RU" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${event.title} | VNVNC`} />
        <meta name="twitter:description" content={`${event.date} в VNVNC Concert Hall. ${cleanDescription}`} />
        <meta name="twitter:image" content="https://vnvnc.ru/og-image.jpg" />
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
        {isHalloween && (
          <>
            <style>{`
              @keyframes stripeMove { 0% { background-position: 0 0 } 100% { background-position: 40px 0 } }
            `}</style>
            {/* single masked overlay for a crisp animated frame */}
            <div className="absolute inset-0 pointer-events-none z-10"
                 style={{
                   boxSizing: 'border-box',
                   padding: '3px',
                   backgroundImage: 'repeating-linear-gradient(45deg,#ffcc00 0 10px,#111 10px 20px)',
                   animation: 'stripeMove 18s linear infinite',
                   WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude'
                 }} />
            {/* lab tag */}
            <div className="absolute top-6 right-6 z-10 px-3 py-1 radius text-xs font-mono tracking-widest bg-black/70 border border-yellow-400/60 text-yellow-300 uppercase">
              ООО "УЖАС"
            </div>
          </>
        )}
        
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
              {isHalloween && (
                <div className="hidden md:block rotate-2">
                  <span className="px-3 py-1 radius text-sm font-mono tracking-widest bg-black/70 border border-yellow-400/50 text-yellow-300 uppercase">
                    ОСТОРОЖНО
                  </span>
                </div>
              )}
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
            className={`${!isHalloween ? 'backdrop-blur-lg' : ''} rounded-3xl p-8 mb-8 border border-white/10`}
            style={{ backgroundColor: isHalloween ? 'rgba(0,0,0,0.12)' : colors.glass.dark }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">О мероприятии</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Description */}
              <div className="order-2 md:order-1 space-y-6">
                <p className="text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description }} />

                {/* CTA: outline brat-style, без тяжёлых эффектов */}
                {!isArchived && (
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className={`ticketscloud-widget inline-flex items-center gap-3 px-8 py-4 radius font-display font-extrabold tracking-wide text-lg border-2 text-white bg-transparent transition-colors duration-150 hover:bg-white hover:text-black ${isHalloween ? 'relative overflow-hidden group' : ''}`}
                    data-tc-event={!isFree ? (event.id as any) : undefined}
                    data-tc-token={!isFree ? import.meta.env.VITE_TC_WIDGET_TOKEN : undefined}
                    data-tc-lang={!isFree ? 'ru' : undefined}
                    data-tc-mini={!isFree ? '1' : undefined}
                    data-tc-style={!isFree ? '1' : undefined}
                    style={isHalloween ? { borderColor: '#ffcc00' } : undefined}
                    onClick={(e)=>{
                      if (isFree) {
                        e.preventDefault()
                        trackTicketClick({ eventId: event.id as any, title: event.title, source: 'detail_button_free' })
                        const el = e.currentTarget as HTMLAnchorElement
                        const old = el.textContent
                        el.textContent = 'вход свободный'
                        setTimeout(()=>{ if (el) el.textContent = old || 'тикеты' },1200)
                      } else {
                        trackTicketClick({ eventId: event.id as any, title: event.title, source: 'detail_button' })
                      }
                    }}
                  >
                    {isHalloween && (
                      <span className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,204,0,0.25), rgba(255,204,0,0.25) 12px, transparent 12px, transparent 24px)' }} />
                    )}
                    {isHalloween ? <TriangleAlert size={22} /> : <ShoppingCart size={22} />}
                    {isFree ? 'free' : 'тикеты'}
                    {event.price && (
                      <span className="ml-2 px-3 py-1 rounded-md text-sm border border-white/20">
                        {event.price}
                      </span>
                    )}
                  </motion.a>
                )}
              </div>
              
              {/* Poster - scaled to match description height */}
              <div className="order-1 md:order-2 flex items-start">
                <div className="w-full max-w-md mx-auto">
                  <div 
                    className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => setLightboxOpen(true)}
                  >
                    {/* Keep 3:4 strict aspect and cover to avoid side bars */}
                    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden" style={{ backgroundColor: colors.glass.darker }}>
                      <img
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {isHalloween && (
                      <>
                        <style>{`
                          @keyframes hazardSlide { from { background-position: 0 0; } to { background-position: 48px 0; } }
                        `}</style>
                        <div
                          className="absolute -left-12 -right-12 top-8 h-6 rotate-[-16deg] z-20 pointer-events-none"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,204,0,0.9) 0 10px, rgba(0,0,0,0.95) 10px 20px)',
                            animation: 'hazardSlide 10s linear infinite',
                            opacity: 0.65,
                            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.45))',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
                          }}
                        />
                      </>
                    )}
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
            className={`${!isHalloween ? 'backdrop-blur-lg' : ''} rounded-3xl p-8 border border-white/10 relative overflow-hidden`}
            style={{ backgroundColor: isHalloween ? 'rgba(0,0,0,0.12)' : colors.glass.dark }}
          >
            {/* лёгкий фон без анимации */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                 style={{ background: isHalloween ? 'repeating-linear-gradient(45deg, rgba(255,204,0,0.08), rgba(255,204,0,0.08) 14px, transparent 14px, transparent 28px)' : `radial-gradient(1200px 600px at 100% 0%, ${colors.neon.red}22, transparent)` }} />
            
            <h3 className="text-2xl font-bold text-white mb-8 relative">Информация о мероприятии</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Event Info */}
              <div className="space-y-6">
                <div className="group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:border-red-500/30 transition-colors"
                         style={{ backgroundColor: isHalloween ? 'rgba(0,0,0,0.3)' : colors.glass.darker }}>
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
                           style={{ backgroundColor: isHalloween ? 'rgba(0,0,0,0.3)' : colors.glass.darker }}>
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
                           style={{ backgroundColor: isHalloween ? 'rgba(0,0,0,0.3)' : colors.glass.darker }}>
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
                           style={{ backgroundColor: isHalloween ? 'rgba(0,0,0,0.3)' : colors.glass.darker }}>
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
                           style={{ backgroundColor: isHalloween ? 'rgba(0,0,0,0.3)' : colors.glass.darker }}>
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
                {!isArchived ? (
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className={`ticketscloud-widget px-8 py-4 radius font-display font-extrabold tracking-wide text-lg border-2 text-white bg-transparent transition-colors duration-150 hover:bg-white hover:text-black flex items-center gap-3 ${isHalloween ? 'relative overflow-hidden group' : ''}`}
                    data-tc-event={!isFree ? (event.id as any) : undefined}
                    data-tc-token={!isFree ? import.meta.env.VITE_TC_WIDGET_TOKEN : undefined}
                    data-tc-lang={!isFree ? 'ru' : undefined}
                    data-tc-mini={!isFree ? '1' : undefined}
                    data-tc-style={!isFree ? '1' : undefined}
                    style={isHalloween ? { borderColor: '#ffcc00' } : undefined}
                    onClick={(e)=>{
                      if (isFree) {
                        e.preventDefault()
                        trackTicketClick({ eventId: event.id as any, title: event.title, source: 'detail_button_free' })
                        const el = e.currentTarget as HTMLAnchorElement
                        const old = el.textContent
                        el.textContent = 'вход свободный'
                        setTimeout(()=>{ if (el) el.textContent = old || 'тикеты' },1200)
                      } else {
                        trackTicketClick({ eventId: event.id as any, title: event.title, source: 'detail_button' })
                      }
                    }}
                  >
                    {isHalloween && (
                      <span className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,204,0,0.25), rgba(255,204,0,0.25) 12px, transparent 12px, transparent 24px)' }} />
                    )}
                    {isHalloween ? <TriangleAlert size={22} /> : <ShoppingCart size={22} />}
                    {isFree ? 'free' : 'тикеты'}
                  </motion.a>
                ) : (
                  hasPhotos && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-8 py-4 radius font-display font-medium tracking-wide text-lg border border-white/20 backdrop-blur-sm transition-all duration-300 flex items-center gap-3"
                      style={{
                        backgroundColor: colors.glass.white,
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.glass.whiteHover
                        e.currentTarget.style.borderColor = colors.neon.red + '66'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.glass.white
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      }}
                      onClick={() => {
                        // Navigate to gallery with date parameter
                        navigate(`/gallery?date=${eventPhotoDate}`)
                      }}
                    >
                      <Camera size={22} />
                      Фотоотчет
                    </motion.button>
                  )
                )}
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
