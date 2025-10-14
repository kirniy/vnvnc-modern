import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, ShoppingCart, Camera } from 'lucide-react'
import { colors } from '../utils/colors'
import { trackTicketClick } from './AnalyticsTracker'
import { getShortDayOfWeek, isInHalloween } from '../utils/dateHelpers'
import { shouldTreatAsFree } from '../config/eventsConfig'
import { useHasPhotosForDate } from '../hooks/usePhotoDateAvailability'

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  price: string
  image: string
  description: string
  attendees: number
  age_rating?: number
  widget_available?: boolean
  purchase_url?: string
  poster_small?: string
  poster_original?: string
  hasPrice: boolean
  rawDate: Date
}

interface EventCardProps {
  event: Event
  index: number
}

const EventCardNew = ({ event, index }: EventCardProps) => {
  const navigate = useNavigate();

  // Format event date to YYYY-MM-DD for photo availability check
  const getEventDateForPhotos = () => {
    if (event.rawDate) {
      const eventDate = new Date(event.rawDate);
      const moscowDate = new Date(eventDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
      const year = moscowDate.getFullYear();
      const month = (moscowDate.getMonth() + 1).toString().padStart(2, '0');
      const day = moscowDate.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return undefined;
  };

  const eventPhotoDate = getEventDateForPhotos();
  const { hasPhotos } = useHasPhotosForDate(eventPhotoDate);
  
  // Generate short date-based URL for the event
  const getShortUrl = () => {
    if (event.rawDate) {
      const eventDate = new Date(event.rawDate);
      const moscowDate = new Date(eventDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
      const day = moscowDate.getDate().toString().padStart(2, '0');
      const month = (moscowDate.getMonth() + 1).toString().padStart(2, '0');
      const year = moscowDate.getFullYear().toString().slice(-2);
      return `/e/${day}-${month}-${year}`;
    }
    // Fallback to regular URL if no date
    return `/events/${event.id}`;
  };

  // Calculate if this is an archived event based on date
  const now = new Date()
  
  // Create a date object for "today" at 6 AM Moscow time
  const todayMoscow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  const cutoffTime = new Date(todayMoscow)
  cutoffTime.setHours(6, 0, 0, 0)
  
  // If it's currently before 6 AM Moscow time, use yesterday's 6 AM as cutoff
  // This way, events from last night (e.g., 11 PM) still show as current until 6 AM
  if (todayMoscow.getHours() < 6) {
    cutoffTime.setDate(cutoffTime.getDate() - 1)
  }
  
  const isArchived = new Date(event.rawDate) < cutoffTime
  const isFree = shouldTreatAsFree(event.id, event.rawDate, event.title)
  const isHalloween = isInHalloween(event.rawDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.2) }}
      whileHover={{ y: -4, scale: 1.012 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => navigate(getShortUrl())}
      className="relative group cursor-pointer"
    >
      <div className="relative overflow-hidden radius-lg backdrop-blur-lg border border-white/10"
           style={{ backgroundColor: colors.glass.dark }}>
        
        {/* 3:4 Portrait Image Container - Properly scaled on mobile */}
        <div className="relative aspect-[3/4] overflow-hidden bg-black z-[1]">
          <img
            src={event.poster_small || event.image}  // Use small image if available
            alt={event.title}
            loading="lazy"  // Enable lazy loading for performance
            decoding="async"  // Async decoding for better performance
            className="w-full h-full object-cover object-center will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'translateZ(0)',
              willChange: 'transform'  // Optimize for animations
            }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-red/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" 
               style={{ background: `linear-gradient(45deg, transparent, ${colors.neon.red}33, transparent)` }} />

          {/* Halloween caution stripes (temporary, non-invasive) */}
          {isHalloween && (
            <>
              <div className="absolute top-0 left-0 right-0 h-3 z-20 opacity-85"
                   style={{ backgroundImage: `repeating-linear-gradient(45deg, #ffcc00, #ffcc00 12px, #111 12px, #111 24px)` }} />
              <div className="absolute bottom-0 left-0 right-0 h-3 z-20 opacity-85"
                   style={{ backgroundImage: `repeating-linear-gradient(45deg, #ffcc00, #ffcc00 12px, #111 12px, #111 24px)` }} />
              <div className="absolute top-6 right-4 z-30 px-2.5 py-1.5 radius text-[13px] font-mono tracking-widest bg-black/70 border border-yellow-400/60 text-yellow-300 uppercase">
                ООО "УЖАС" 
              </div>
              {/* Easter egg: hidden micro QR sticker */}
              <div className="absolute left-3 bottom-3 w-6 h-6 opacity-70 rotate-12" title="lab access">
                <div className="w-full h-full radius" style={{ background: 'conic-gradient(from 45deg, #ffcc00 0 25%, #111 0 50%, #ffcc00 0 75%, #111 0)' }} />
              </div>
            </>
          )}
          {/* Hard bottom blocker to prevent poster bleed */}
          <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 bg-black z-20 pointer-events-none" />
          
          {/* Age Rating Sticker */}
          {event.age_rating && (
            <div className="absolute top-3 left-3">
              <div className="px-2.5 py-1 radius text-xs font-display font-extrabold bg-white text-black">
                {event.age_rating}+
              </div>
            </div>
          )}
          
          {/* Archive Badge */}
          {isArchived && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-md border border-white/20"
                 style={{ backgroundColor: colors.glass.dark }}>
              <span className="text-white/60 text-sm">Архив</span>
            </div>
          )}
          
          {/* Content Overlay - Positioned at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-30 transition-opacity duration-300 ease-out group-hover:opacity-100">
            <h3 className="text-base sm:text-xl md:text-2xl font-display font-extrabold lowercase text-white mb-1 drop-shadow-lg text-stretch-heading">
              {event.title}
            </h3>
            
            <div className="space-y-1 sm:space-y-2 text-[11px] sm:text-sm text-stretch-body">
              <div className="flex items-center gap-2 text-white/90">
                <Calendar size={14} style={{ color: colors.neon.red }} />
                <span>{event.date}{getShortDayOfWeek(event.date) && ` • ${getShortDayOfWeek(event.date)}`}</span>
              </div>
              
              {event.time && (
                <div className="flex items-center gap-2 text-white/90">
                  <Clock size={14} style={{ color: colors.neon.red }} />
                  <span>{event.time}</span>
                </div>
              )}
              
              {event.location && (
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin size={14} style={{ color: colors.neon.red }} />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-black/0">
          {/* Short Description */}
          <p className="text-white/70 text-xs sm:text-sm line-clamp-2 text-stretch-body" 
             dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }} />
          
          {/* Price and Action */}
          <div className="flex items-center justify-between">
            {(!isFree && event.hasPrice && event.price) ? (
              <div className="text-base sm:text-lg font-bold text-white">
                {event.price}
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-white/50">{isFree ? 'бесплатно' : 'FC/DC'}</div>
            )}
            
            {/* Action Button */}
            {!isArchived ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 radius font-display font-extrabold text-sm flex items-center gap-2 border-2 border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFree) {
                    trackTicketClick({ eventId: event.id, title: event.title, source: 'card_button_free' })
                    const el = e.currentTarget
                    const old = el.textContent
                    el.textContent = 'вход свободный'
                    setTimeout(() => { if (el) el.textContent = old || 'тикеты' }, 1200)
                  } else {
                    trackTicketClick({ eventId: event.id, title: event.title, source: 'card_button' })
                    navigate(getShortUrl());
                  }
                }}
              >
                <ShoppingCart size={16} />
                {isFree ? 'free' : 'тикеты'}
              </motion.button>
            ) : (
              hasPhotos && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 radius font-medium text-sm flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/20"
                  style={{
                    backgroundColor: colors.glass.white,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.glass.whiteHover;
                    e.currentTarget.style.borderColor = colors.neon.red + '66';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.glass.white;
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to gallery with date parameter
                    navigate(`/gallery?date=${eventPhotoDate}`);
                  }}
                >
                  <Camera size={16} />
                  Фотоотчет
                </motion.button>
              )
            )}
          </div>
        </div>

        {/* Hover Glow Effect with solid base to prevent bottom bleed-through */}
        <div className="absolute inset-0 radius-lg pointer-events-none z-[2]">
          {/* solid base */}
          <div className="absolute inset-0 bg-black/20" />
          {/* glow border (orange tone for Halloween) */}
          <div className="absolute inset-0 radius-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
               style={{ boxShadow: isHalloween ? `0 0 24px #ffcc0055, inset 0 0 18px #ffcc0022` : `0 0 24px ${colors.neon.red}55, inset 0 0 18px ${colors.neon.red}22`, border: isHalloween ? `1px solid #ffcc0040` : `1px solid ${colors.neon.red}40` }} />
          {isHalloween && (
            <div className="absolute inset-0 radius-lg" style={{ boxShadow: 'inset 0 0 0 2px rgba(255,204,0,0.25)' }} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default EventCardNew