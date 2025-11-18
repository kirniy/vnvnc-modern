import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../services/ticketsCloud'
import EventCardNew from '../components/EventCardNew'
import BackButton from '../components/BackButton'
import { SundayFreeBadge } from '../components/SundayFreeBadge'
import { buildLocalBusinessJsonLd, buildBreadcrumbJsonLd, createBreadcrumbTrail } from '../utils/seo/siteSchema'
import Seo from '../components/Seo'
import { getEventDateKey } from '../utils/eventSlug'
// Dither удалён по фидбеку

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'archive'>('current')
  const [activeMonth, setActiveMonth] = useState<string | 'all'>('all')

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

  const months = useMemo(() => ['all','01','02','03','04','05','06','07','08','09','10','11','12'], [])

  const dateCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const event of events as any[]) {
      const key = getEventDateKey(event)
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [events])

  const getSameDateCount = (event: any) => {
    const key = getEventDateKey(event)
    if (!key) return 1
    return dateCounts.get(key) ?? 1
  }

  return (
    <div className="min-h-screen pt-20 relative">
      <Seo
        title="Афиша | VNVNC Concert Hall"
        description="Актуальные и предстоящие события VNVNC: концерты, диджей-сеты и вечеринки. Покупка билетов и бронирование столов онлайн."
        canonical="https://vnvnc.ru/events"
        keywords={[
          'афиша vnvnc',
          'вечеринки санкт-петербург',
          'концерты санкт-петербург',
          'ночной клуб vnvnc',
        ]}
        jsonLd={[
          buildLocalBusinessJsonLd(),
          buildBreadcrumbJsonLd(
            createBreadcrumbTrail([
              { name: 'Афиша', url: 'https://vnvnc.ru/events' },
            ]),
          ),
        ]}
      />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <BackButton to="/" text="на главную" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white mb-6 lowercase text-stretch-heading break-words">мероприятия</h1>
          {/* Sunday Free Entry Badge */}
          <div className="flex justify-center">
            <SundayFreeBadge />
          </div>
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

        {/* Month chips (mobile‑scrollable) - only for archive */}
        {activeTab === 'archive' && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {months.map(m => (
              <button
                key={m}
                onClick={() => setActiveMonth(m)}
                className={`px-3 py-1.5 radius text-sm whitespace-nowrap ${activeMonth===m? 'text-white' : 'text-white/70 hover:text-white'}`}
                style={activeMonth===m? { backgroundColor: '#ff1a1a' } : { backgroundColor: 'rgba(255,255,255,0.06)' }}
              >{m==='all' ? 'все месяцы' : m}</button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-white/70 mt-4">Загружаем события...</p>
          </div>
        )}

        {/* Events Grid – мобильные карточки более компактные */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeTab === 'current' ? (
              currentEvents.map((event: any, index: number) => (
                <EventCardNew
                  key={event.id}
                  event={event}
                  index={index}
                  sameDateCount={getSameDateCount(event)}
                />
              ))
            ) : (
              archiveEvents
                .filter((event: any) => activeMonth==='all' ? true : (new Date(event.rawDate).toISOString().slice(5,7)===activeMonth))
                .map((event: any, index: number) => (
                  <EventCardNew
                    key={event.id}
                    event={event}
                    index={index}
                    sameDateCount={getSameDateCount(event)}
                  />
                ))
            )}
          </div>
        )}

        {!isLoading && activeTab === 'current' && currentEvents.length === 0 && (
          <div className="text-center text-white">
            <Ticket size={64} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-2xl font-bold mb-2">Нет актуальных мероприятий</h3>
            <p className="text-white/70">Проверьте позже для новых событий</p>
          </div>
        )}

        {!isLoading && activeTab === 'archive' && archiveEvents.length === 0 && (
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
