import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import { colors } from '../utils/colors'

interface Announcement {
  id: string
  text: string
  link?: string
  linkText?: string
}

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Sample announcements - in production, these would come from a CMS or API
  const announcements: Announcement[] = [
    {
      id: '1',
      text: 'VIP столы со скидкой 20% при раннем бронировании',
      link: '/reservations',
      linkText: 'Забронировать'
    },
    {
      id: '2',
      text: 'Каждую пятницу и субботу: лучшие DJ Санкт-Петербурга',
      link: '/events',
      linkText: 'Афиша'
    },
    {
      id: '3',
      text: 'Специальные цены на барную карту для именинников',
      link: '/contact',
      linkText: 'Подробнее'
    }
  ]

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(timer)
  }, [announcements.length])

  if (!isVisible || announcements.length === 0) return null

  const currentAnnouncement = announcements[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden backdrop-blur-md border-b border-white/10"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
      >
        <div className="relative">
          {/* Remove animated background pattern - keep it simple */}

          <div className="relative z-10 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Sparkles size={16} className="animate-pulse" style={{ color: colors.neon.red }} />
                
                {/* Announcement text with fade transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAnnouncement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-white/90 font-normal text-sm">
                      {currentAnnouncement.text}
                    </span>
                    
                    {currentAnnouncement.link && (
                      <motion.a
                        href={currentAnnouncement.link}
                        className="hidden sm:inline-flex items-center gap-1 font-medium text-sm hover:underline"
                        style={{ color: colors.neon.red }}
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {currentAnnouncement.linkText}
                        <ArrowRight size={12} />
                      </motion.a>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dots indicator for multiple announcements */}
              {announcements.length > 1 && (
                <div className="hidden sm:flex items-center gap-1 mx-4">
                  {announcements.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: index === currentIndex 
                          ? 'white' 
                          : 'rgba(255, 255, 255, 0.3)',
                        transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Закрыть"
              >
                <X size={16} className="text-white/60 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AnnouncementBanner