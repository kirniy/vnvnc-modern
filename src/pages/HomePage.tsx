import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { ticketsCloudService } from '../services/ticketsCloud'
import ModernHero from '../components/ModernHero'
import ModernEventCard from '../components/ModernEventCard'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  price: string
  image: string
  attendees: number
  rawDate: Date
  hasPrice: boolean
}

const HomePage = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      return await ticketsCloudService.getEvents()
    },
  })

  const upcomingEvents = events
    .filter((event: Event) => new Date(event.date) > new Date())
    .slice(0, 3)

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

  return (
    <div className="min-h-screen">
      {/* Modern Hero */}
      <ModernHero />
      
      {/* Upcoming Events */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold text-white mb-4">
              Предстоящие <span className="text-red-500">мероприятия</span>
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Не пропустите самые горячие вечеринки и концерты в центре Санкт-Петербурга
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event: Event, index: number) => (
              <ModernEventCard key={event.id} event={event} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.a 
              href="/events" 
              className="bg-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-red-700 transition-all duration-300 inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Все мероприятия</span>
              <Ticket size={20} />
            </motion.a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold text-white mb-4">
              Почему <span className="text-red-500">VNVNC</span>?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Центр города',
                description: 'Конюшенная площадь 2В - в самом сердце Санкт-Петербурга'
              },
              {
                icon: Calendar,
                title: 'VIP-обслуживание',
                description: 'Персональный подход к каждому гостю'
              },
              {
                icon: Ticket,
                title: 'Лучшие мероприятия',
                description: 'Только топовые артисты и незабываемые вечеринки'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-8 bg-black/30 backdrop-blur-sm rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
