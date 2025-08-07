import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { ticketsCloudService } from '../services/ticketsCloud'
import ModernHero from '../components/ModernHero'
import EventCardNew from '../components/EventCardNew'
import { colors } from '../utils/colors'
import DitherBackground from '../components/DitherBackground'

const HomePage = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => ticketsCloudService.getEvents(),
  })

  // Get current time and convert to Moscow timezone for display
  const now = new Date()
  
  // Create a date object for "today" at 6 AM Moscow time
  // We'll use this as the cutoff - events before this time are considered "past"
  const todayMoscow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  const cutoffTime = new Date(todayMoscow)
  cutoffTime.setHours(6, 0, 0, 0)
  
  // If it's currently before 6 AM Moscow time, use yesterday's 6 AM as cutoff
  // This way, events from last night (e.g., 11 PM) still show as current until 6 AM
  if (todayMoscow.getHours() < 6) {
    cutoffTime.setDate(cutoffTime.getDate() - 1)
  }

  const upcomingEvents = (events as any[])
    .filter((event: any) => {
      if (!event.rawDate) return false
      const eventDate = new Date(event.rawDate)
      // Show events that are after the cutoff time (including today's events)
      return eventDate >= cutoffTime
    })
    .sort((a: any, b: any) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-black">
      <ModernHero />
      
      {/* Upcoming Events Section */}
      <section className="py-16 relative">
        {/* Dither Background for Events Section */}
        <DitherBackground />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Предстоящие мероприятия</h2>
            <p className="text-xl text-white/70">Ближайшие события в VNVNC</p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event: any, index: number) => (
                <EventCardNew key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center text-white">
              <Calendar size={64} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-2xl font-bold mb-2">Нет предстоящих мероприятий</h3>
              <p className="text-white/70">Проверьте позже для новых событий</p>
            </div>
          )}

          {upcomingEvents.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/events"
                className="inline-flex items-center text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 gap-2"
                style={{ 
                  backgroundColor: colors.neon.red,
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
              >
                Все мероприятия
                <ArrowRight size={20} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
