import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
// import AnnouncementBanner from './components/AnnouncementBanner' // Disabled for now
import LoadingSpinner from './components/LoadingSpinner'
// TEMPORARILY DISABLED - Age gate causing DOM errors
// import AgeGate from './components/AgeGate'
import TelegramButton from './components/TelegramButton'
// TEMPORARILY DISABLED - MinimalCursor causing DOM errors
// import MinimalCursor from './components/ui/MinimalCursor'
import ScrollToTop from './components/ScrollToTop'
// import GlitchScanLines from './components/ui/GlitchScanLines' - removed per user request
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
// import BackgroundShader from './components/BackgroundShader' // DISABLED - causing SVG errors

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'))
const RulesPage = lazy(() => import('./pages/RulesPage'))
const RentalPage = lazy(() => import('./pages/RentalPage'))
const ShortUrlRedirect = lazy(() => import('./components/ShortUrlRedirect'))

// Custom loading component that hides the footer
const LoadingWithHiddenFooter = () => {
  return (
    <>
      <style>{`
        footer {
          display: none !important;
        }
      `}</style>
      <LoadingSpinner />
    </>
  )
}

function App() {
  // Gallery re-enabled with fixed Yandex Cloud Function
  // Initialize Telegram WebApp features
  const { isInTelegram } = useTelegramWebApp()

  useEffect(() => {
    // Add class to body when in Telegram - with safety checks
    if (typeof document !== 'undefined' && document.body) {
      if (isInTelegram) {
        document.body.classList.add('telegram-webapp')
      }
      return () => {
        if (document.body) {
          document.body.classList.remove('telegram-webapp')
        }
      }
    }
  }, [isInTelegram])

  return (
    <>
      {/* TEMPORARILY DISABLED - Age gate causing DOM errors */}
      {/* <AgeGate /> */}
      {/* <AnnouncementBanner /> - Disabled for now */}
      <Navigation />
      {/* <BackgroundShader /> - DISABLED - causing SVG errors */}
      {/* TEMPORARILY DISABLED - MinimalCursor might be causing DOM errors */}
      {/* <MinimalCursor /> */}
      <ScrollToTop />
      
      <main className="relative">
        <Suspense fallback={<LoadingWithHiddenFooter />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/e/:slug" element={<ShortUrlRedirect />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/rental" element={<RentalPage />} />
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
      <TelegramButton />
      <Analytics />
    </>
  )
}

export default App
