import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

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
}

interface ModernEventCardProps {
  event: Event
  index: number
}

const ModernEventCard = ({ event, index }: ModernEventCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate();
  
  
  
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => navigate(`/events/${event.id}`)}
      className="relative group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
        {/* Background image with overlay */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="relative p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                {event.title}
              </h3>
              <p className="text-white/80 text-sm line-clamp-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }} />
            </div>
            
            {event.hasPrice && (
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold"
              >
                {event.price}
              </motion.div>
            )}
          </div>

          {/* Event details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-white">
              <Calendar size={16} className="text-red-500" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Clock size={16} className="text-red-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <MapPin size={16} className="text-red-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Users size={16} className="text-red-500" />
              <span>{event.age_rating ? `${event.age_rating}+` : 'Все возрасты'}</span>
            </div>
          </div>

          {/* Purchase button */}
          <a
            href="#"
            className="ticketscloud-widget w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
            data-tc-event={event.id}
            data-tc-token={import.meta.env.VITE_TC_WIDGET_TOKEN}
            data-tc-lang="ru"
            data-tc-mini="1"
            data-tc-style="1"
          >
            <ShoppingCart size={18} />
            Купить билет
          </a>
        </div>

        {/* Hover effect border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  )
}

export default ModernEventCard
