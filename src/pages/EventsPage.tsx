import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../services/ticketsCloud'
import ModernEventCard from '../components/ModernEventCard'

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'archive'>('current')

  const { data: events = [] } = useQuery({
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

  const currentEvents = (events as any[])
    .filter((event: any) => {
      const eventDate = new Date(event.rawDate)
      // Show events until 6 AM Moscow time the next day
      return eventDate >= cutoffTime
    })
    .sort((a: any, b: any) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())

  const archiveEvents = (events as any[])
    .filter((event: any) => {
      const eventDate = new Date(event.rawDate)
      // Archive events that are before the cutoff time
      return eventDate < cutoffTime
    })
    .sort((a: any, b: any) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">Мероприятия</h1>
          <p className="text-xl text-white/70">Все события в VNVNC</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === 'current'
                  ? 'bg-red-600 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Актуальные
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === 'archive'
                  ? 'bg-red-600 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Архив
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'current' ? (
            currentEvents.map((event: any, index: number) => (
              <ModernEventCard key={event.id} event={event} index={index} />
            ))
          ) : (
            archiveEvents.map((event: any, index: number) => (
              <ModernEventCard key={event.id} event={event} index={index} />
            ))
          )}
        </div>

        {activeTab === 'current' && currentEvents.length === 0 && (
          <div className="text-center text-white">
            <Ticket size={64} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-2xl font-bold mb-2">Нет актуальных мероприятий</h3>
            <p className="text-white/70">Проверьте позже для новых событий</p>
          </div>
        )}

        {activeTab === 'archive' && archiveEvents.length === 0 && (
          <div className="text-center text-white">
            <Ticket size={64} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-2xl font-bold mb-2">Архив пуст</h3>
            <p className="text-white/70">Прошедших мероприятий пока нет</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage
