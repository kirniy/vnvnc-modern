import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, ShoppingCart } from 'lucide-react'
import { ticketsCloudService } from '../services/ticketsCloud'
import ModernHero from '../components/ModernHero'

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
      <section className="py-16">
        <div className="container mx-auto px-4">
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
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  
                  <div className="relative p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white hover:text-red-400 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-white/80 text-sm line-clamp-2" 
                         dangerouslySetInnerHTML={{ __html: event.description }} />
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center gap-2 text-white">
                        <Calendar size={16} className="text-red-500" />
                        <span>{event.date}</span>
                      </div>
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      Подробнее
                    </Link>
                  </div>
                </motion.div>
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
                className="inline-flex items-center bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Все мероприятия
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
