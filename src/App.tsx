import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
// import AnnouncementBanner from './components/AnnouncementBanner' // Disabled for now
import LoadingSpinner from './components/LoadingSpinner'
import AgeGate from './components/AgeGate'
import TelegramButton from './components/TelegramButton'
import MinimalCursor from './components/ui/MinimalCursor'
// import BackgroundShader from './components/BackgroundShader' // DISABLED - causing SVG errors

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'))
const RulesPage = lazy(() => import('./pages/RulesPage'))
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
  return (
    <>
      <AgeGate />
      {/* <AnnouncementBanner /> - Disabled for now */}
      <Navigation />
      {/* <BackgroundShader /> - DISABLED - causing SVG errors */}
      <MinimalCursor />
      
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
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
      <TelegramButton />
    </>
  )
}

export default App
