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

  // Get current time in Moscow timezone (UTC+3)
  const now = new Date()
  const moscowTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)) // Add 3 hours for Moscow time
  
  // Calculate cutoff time (6 AM Moscow time of the next day)
  const cutoffTime = new Date(moscowTime)
  cutoffTime.setHours(6, 0, 0, 0)
  if (moscowTime.getHours() >= 6) {
    cutoffTime.setDate(cutoffTime.getDate() + 1)
  }

  const upcomingEvents = (events as any[])
    .filter((event: any) => {
      const eventDate = new Date(event.rawDate)
      // Show events until 6 AM Moscow time the next day
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
