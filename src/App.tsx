import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
// import AnnouncementBanner from './components/AnnouncementBanner' // Disabled for now
import CinematicLoader from './components/CinematicLoader'
import AgeGate from './components/AgeGate'
import TelegramButton from './components/TelegramButton'
// TEMPORARILY DISABLED - MinimalCursor causing DOM errors
// import MinimalCursor from './components/ui/MinimalCursor'
import ScrollToTop from './components/ScrollToTop'
import AnalyticsTracker from './components/AnalyticsTracker'
// import GlitchScanLines from './components/ui/GlitchScanLines' - removed per user request
import GlobalBackground from './components/GlobalBackground'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import SnowOverlay from './components/effects/SnowOverlay'
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
const MerchPage = lazy(() => import('./pages/MerchPage'))
const ShortUrlRedirect = lazy(() => import('./components/ShortUrlRedirect'))

// Custom loading fallback (just deep red to prevent flash)
const SimpleBlackFallback = () => <div className="fixed inset-0 bg-[#2a0404] z-50" />

function App() {
  // Gallery re-enabled with fixed Yandex Cloud Function
  // Initialize Telegram WebApp features
  const { isInTelegram } = useTelegramWebApp()
  const [showSnow, setShowSnow] = useState(false)

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

  useEffect(() => {
    // Show snow on all devices when user doesn't prefer reduced motion
    // SnowOverlay handles different flake counts: mobile=35, tablet=60, desktop=100
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const reduced = motionQuery?.matches ?? false
      setShowSnow(!reduced) // Snow for everyone!
    }
    update()
    window.addEventListener('resize', update)
    if (motionQuery?.addEventListener) {
      motionQuery.addEventListener('change', update)
    } else if (motionQuery?.addListener) {
      motionQuery.addListener(update)
    }
    return () => {
      window.removeEventListener('resize', update)
      if (motionQuery?.removeEventListener) {
        motionQuery.removeEventListener('change', update)
      } else if (motionQuery?.removeListener) {
        motionQuery.removeListener(update)
      }
    }
  }, [])

  // Performance testing: ?noblur disables all blur effects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('noblur')) {
      document.documentElement.classList.add('noblur')
      console.log('🚀 NOBLUR MODE: All blur effects disabled for performance testing')
    }
    return () => {
      document.documentElement.classList.remove('noblur')
    }
  }, [])

  return (
    <>
      <CinematicLoader /> {/* Intro acts as top-level curtain */}
      <GlobalBackground />
      <AgeGate />
      {/* <AnnouncementBanner /> - Disabled for now */}
      <Navigation />
      {/* <BackgroundShader /> - DISABLED - causing SVG errors */}
      {/* TEMPORARILY DISABLED - MinimalCursor might be causing DOM errors */}
      {/* <MinimalCursor /> */}
      <ScrollToTop />
      <AnalyticsTracker />

      <main className="relative">
        <Suspense fallback={<SimpleBlackFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merch" element={<MerchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
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
      {showSnow && <SnowOverlay />}
      <Analytics />
    </>
  )
}

export default App
