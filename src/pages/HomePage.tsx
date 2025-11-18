import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { ticketsCloudService } from '../services/ticketsCloud'
import ModernHero from '../components/ModernHero'
import EventCardNew from '../components/EventCardNew'
import NewsTicker from '../components/ui/NewsTicker'
import { colors } from '../utils/colors'
import {
  buildLocalBusinessJsonLd,
  buildBreadcrumbJsonLd,
  createBreadcrumbTrail,
  buildVideoObjectJsonLd,
} from '../utils/seo/siteSchema'
import Seo from '../components/Seo'
import { getEventDateKey } from '../utils/eventSlug'
// Убрали DitherBackground — по фидбеку

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
    <div className="min-h-screen">
      <Seo
        title="VNVNC | Официальный портал"
        description="Конюшенная 2В • Культовый клуб в центре Санкт-Петербурга • Здесь всегда атмосферно • Бронь столов и билеты онлайн."
        canonical="https://vnvnc.ru/"
        keywords={[
          'vnvnc',
          'ночной клуб санкт-петербург',
          'вечеринки спб',
          'конюшенная площадь 2в',
        ]}
        jsonLd={[
          buildLocalBusinessJsonLd(),
          buildBreadcrumbJsonLd(createBreadcrumbTrail([])),
          buildVideoObjectJsonLd({
            name: 'VNVNC Aftermovie',
            description: 'VNVNC — ночной клуб в центре Санкт-Петербурга. Погрузитесь в атмосферу вечеринки и бронируйте столы онлайн.',
            thumbnailUrl: 'https://vnvnc.ru/og-image.jpg',
            contentUrl: 'https://vnvnc.ru/herovideo-optimized.mp4',
            uploadDate: '2024-12-01T00:00:00+03:00',
            duration: 'PT1M',
          }),
        ]}
      />

      <ModernHero />
      
      {/* Ticker between sections */}
      <div 
        className="relative z-20 border-t border-b border-white/10" 
        style={{ background: `linear-gradient(90deg, ${colors.neon.red}, #b30000)` }}
      >
        <NewsTicker 
          text="конюшенная 2в × конюшенная 2в × " 
          speedMs={52000} 
          className="text-[11px] sm:text-sm tracking-[0.15em] uppercase text-white py-2" 
        />
      </div>
      
      {/* Upcoming Events Section */}
      <section className="py-12 sm:py-20 relative">
        {/* Ambient gradient for section */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white mb-4 lowercase tracking-tight text-stretch-heading">
              предстоящие
            </h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-neon-red to-transparent mb-6 opacity-80" 
                 style={{ background: `linear-gradient(90deg, transparent, ${colors.neon.red}, transparent)` }} />
            <p className="text-base sm:text-xl text-white/60 lowercase tracking-wide max-w-xl mx-auto font-light">
              ближайшие события в vnvnc
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any, index: number) => (
                <EventCardNew
                  key={event.id}
                  event={event}
                  index={index}
                  sameDateCount={getSameDateCount(event)}
                />
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
                className="inline-flex items-center px-8 py-3 radius font-display font-extrabold gap-2 border-2 border-white text-white hover:bg-white hover:text-black transition-colors"
              >
                все мероприятия
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
