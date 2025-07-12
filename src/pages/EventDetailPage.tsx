import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, ArrowLeft, ShoppingCart } from 'lucide-react'
import { ticketsCloudService } from '../services/ticketsCloud'

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      return await ticketsCloudService.getEventDetails(id || '')
    },
  })
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-red-600 opacity-20"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Мероприятие не найдено</h1>
          <Link to="/events" className="text-red-500 hover:text-red-400">
            ← Вернуться к афише
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link
              to="/events"
              className="inline-flex items-center space-x-2 text-white hover:text-red-500 mb-4"
            >
              <ArrowLeft size={20} />
              <span>Назад к афише</span>
            </Link>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white"
            >
              {event.title}
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4">О мероприятии</h2>
                <p className="text-white leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description }} />
              </motion.div>

              {/* Event Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 rounded-2xl p-8 mt-8"
              >
                <h3 className="text-xl font-bold text-white mb-4">Информация</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-red-500" size={20} />
                    <span className="text-white">{event.date}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 rounded-2xl p-8 sticky top-8"
              >
                <motion.a 
                  href="#"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="ticketscloud-widget w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  data-tc-event={event.id}
                  data-tc-token={import.meta.env.VITE_TC_WIDGET_TOKEN}
                  data-tc-lang="ru"
                  data-tc-mini="1"
                  data-tc-style="1"
                >
                  <ShoppingCart size={20} />
                  Купить билет
                </motion.a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EventDetailPage
