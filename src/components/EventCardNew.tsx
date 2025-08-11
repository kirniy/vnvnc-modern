import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, ShoppingCart, Camera } from 'lucide-react'
import { colors } from '../utils/colors'
import { getShortDayOfWeek } from '../utils/dateHelpers'
// import Sticker from './ui/Sticker'

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
  hasPrice: boolean
  rawDate: Date
}

interface EventCardProps {
  event: Event
  index: number
}

const EventCardNew = ({ event, index }: EventCardProps) => {
  const navigate = useNavigate();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -2, scale: 1.005 }}
      onClick={() => navigate(`/events/${event.id}`)}
      className="relative group cursor-pointer"
    >
      <div className="relative overflow-hidden radius-lg backdrop-blur-lg border border-white/10"
           style={{ backgroundColor: colors.glass.dark }}>
        
        {/* 3:4 Portrait Image Container - Properly scaled on mobile */}
        <div className="relative aspect-[3/4] overflow-hidden bg-black">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-red/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" 
               style={{ background: `linear-gradient(45deg, transparent, ${colors.neon.red}33, transparent)` }} />
          
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
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 bg-gradient-to-t from-black via-black/90 to-transparent">
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
            {event.hasPrice && event.price ? (
              <div className="text-base sm:text-lg font-bold text-white">
                {event.price}
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-white/50">
                FC/DC
              </div>
            )}
            
            {/* Action Button */}
            {!isArchived ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 radius font-display font-extrabold text-sm flex items-center gap-2 border-2 border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors"
                onClick={() => {}}
              >
                <ShoppingCart size={16} />
                тикеты
              </motion.button>
            ) : (
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
                  // For now, open a generic link. In the future, we'll implement dynamic linking
                  window.open('https://t.me/vnvnc_spb', '_blank');
                }}
              >
                <Camera size={16} />
                Фотоотчет
              </motion.button>
            )}
          </div>
        </div>

        {/* Hover Glow Effect with base to prevent poster bleed-through */}
        <div className="absolute inset-0 radius-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
             style={{ 
               boxShadow: `0 0 24px ${colors.neon.red}55, inset 0 0 18px ${colors.neon.red}22`,
               border: `2px solid ${colors.neon.red}55`,
               background: 'rgba(0,0,0,0.06)'
             }} />
      </div>
    </motion.div>
  )
}

export default EventCardNew