import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../services/ticketsCloud'
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

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'archive'>('current')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      return await ticketsCloudService.getEvents()
    },
  })

  const now = new Date()
  const currentEvents = events.filter(event => event.rawDate >= now)
  const archiveEvents = events.filter(event => event.rawDate < now)

  const displayedEvents = activeTab === 'current' ? currentEvents : archiveEvents

  const filteredEvents = displayedEvents.filter((event: Event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const groupedEvents = filteredEvents.reduce((acc: Record<string, Event[]>, event: Event) => {
    const monthYear = event.rawDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);
    return acc;
  }, {});
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

  const sortedGroupedEvents = Object.entries(groupedEvents).sort(([_, eventsA], [__, eventsB]) => {
    const dateA = eventsA[0].rawDate;
    const dateB = eventsB[0].rawDate;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            Афиша <span className="text-red-500">мероприятий</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white max-w-2xl mx-auto"
          >
            Найдите идеальное мероприятие для вашего вечера
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Поиск мероприятий..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'current'
                    ? 'bg-red-600 text-white'
                    : 'bg-black/30 backdrop-blur-sm text-white border border-red-500/20 hover:bg-red-500/20'
                }`}
              >
                Актуальные ({currentEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('archive')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'archive'
                    ? 'bg-red-600 text-white'
                    : 'bg-black/30 backdrop-blur-sm text-white border border-red-500/20 hover:bg-red-500/20'
                }`}
              >
                Архив ({archiveEvents.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {Object.entries(groupedEvents).length === 0 ? (
            <div className="text-center py-20">
              <Ticket size={64} className="mx-auto text-red-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Мероприятия не найдены</h3>
              <p className="text-white">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            sortedGroupedEvents.map(([monthYear, events]) => (
              <div key={monthYear} className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 capitalize">{monthYear}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {events.map((event: Event, index: number) => (
                    <ModernEventCard key={event.id} event={event} index={index} />
                  ))}
                
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default EventsPage
