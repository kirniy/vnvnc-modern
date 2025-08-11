import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../services/ticketsCloud'
import EventCardNew from '../components/EventCardNew'
// Dither удалён по фидбеку

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'archive'>('current')

  const { data: events = [] } = useQuery({
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

  const currentEvents = (events as any[])
    .filter((event: any) => {
      if (!event.rawDate) return false
      const eventDate = new Date(event.rawDate)
      // Show events that are after the cutoff time (including today's events)
      return eventDate >= cutoffTime
    })
    .sort((a: any, b: any) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())

  const archiveEvents = (events as any[])
    .filter((event: any) => {
      if (!event.rawDate) return false
      const eventDate = new Date(event.rawDate)
      // Archive events that are before the cutoff time
      return eventDate < cutoffTime
    })
    .sort((a: any, b: any) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-display font-extrabold text-white mb-4 lowercase text-stretch-heading">мероприятия</h1>
          <p className="text-lg text-white/70 lowercase text-stretch-body tracking-wide block">все события в vnvnc</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 radius p-1">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-3 radius font-semibold transition-colors ${activeTab === 'current' ? 'text-white' : 'text-white/70 hover:text-white'}`}
              style={activeTab === 'current' ? { backgroundColor: '#ff1a1a' } : {}}
            >
              Актуальные
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-6 py-3 radius font-semibold transition-colors ${activeTab === 'archive' ? 'text-white' : 'text-white/70 hover:text-white'}`}
              style={activeTab === 'archive' ? { backgroundColor: '#ff1a1a' } : {}}
            >
              Архив
            </button>
          </div>
        </div>

        {/* Events Grid – мобильные карточки более компактные */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeTab === 'current' ? (
            currentEvents.map((event: any, index: number) => (
              <EventCardNew key={event.id} event={event} index={index} />
            ))
          ) : (
            archiveEvents.map((event: any, index: number) => (
              <EventCardNew key={event.id} event={event} index={index} />
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
