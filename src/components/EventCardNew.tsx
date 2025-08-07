import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, ShoppingCart, Camera } from 'lucide-react'
import { colors } from '../utils/colors'
import { getShortDayOfWeek } from '../utils/dateHelpers'

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
      whileHover={{ y: -5, scale: 1.01 }}
      onClick={() => navigate(`/events/${event.id}`)}
      className="relative group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-lg border border-white/10"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-red/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" 
               style={{ background: `linear-gradient(45deg, transparent, ${colors.neon.red}33, transparent)` }} />
          
          {/* Age Rating Badge */}
          {event.age_rating && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-md border border-white/20"
                 style={{ backgroundColor: colors.glass.white }}>
              <span className="text-white text-sm font-bold">{event.age_rating}+</span>
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
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 drop-shadow-lg">
              {event.title}
            </h3>
            
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
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
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Short Description */}
          <p className="text-white/70 text-xs sm:text-sm line-clamp-2" 
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-[12px] font-medium text-sm flex items-center gap-2 transition-all duration-300"
                style={{ 
                  backgroundColor: colors.neon.red,
                  color: 'white',
                  boxShadow: `0 4px 15px ${colors.neon.red}66`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 25px ${colors.neon.red}99`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 15px ${colors.neon.red}66`;
                }}
                onClick={() => {
                  // Let the parent click handler navigate to event page
                }}
              >
                <ShoppingCart size={16} />
                ТИКЕТЫ
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-[12px] font-medium text-sm flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/20"
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

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
             style={{ 
               boxShadow: `0 0 30px ${colors.neon.red}66, inset 0 0 30px ${colors.neon.red}33`,
               border: `2px solid ${colors.neon.red}66`
             }} />
      </div>
    </motion.div>
  )
}

export default EventCardNew