import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { ticketsCloudService } from '../services/ticketsCloud'
import ModernHero from '../components/ModernHero'
import EventCardNew from '../components/EventCardNew'
import NewsTicker from '../components/ui/NewsTicker'
import { colors } from '../utils/colors'
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

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>VNVNC | Официальный портал</title>
        <meta name="description" content="VNVNC Concert Hall, Конюшенная 2В - культовый клуб в центре Санкт-Петербурга. Живая музыка, вечеринки, культурные события." />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="VNVNC Concert Hall" />
        <meta property="og:description" content="Конюшенная 2В - культовый клуб в центре Санкт-Петербурга. Живая музыка, вечеринки, культурные события" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="VNVNC" />
        <meta property="og:image" content="https://vnvnc.ru/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="VNVNC Concert Hall" />
        <meta property="og:locale" content="ru_RU" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VNVNC Concert Hall" />
        <meta name="twitter:description" content="Конюшенная 2В - культовый клуб в центре Санкт-Петербурга. Живая музыка, вечеринки, культурные события" />
        <meta name="twitter:image" content="https://vnvnc.ru/og-image.jpg" />
      </Helmet>

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
      <section className="py-16 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-extrabold text-white mb-4 lowercase text-stretch-y-120">предстоящие</h2>
            <p className="text-xl text-white/70 lowercase tracking-wide block">ближайшие события в vnvnc</p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
