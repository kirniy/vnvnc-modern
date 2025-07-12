import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import BackgroundWrapper from './components/BackgroundWrapper'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'))

function App() {
  return (
    <BackgroundWrapper>
      <Navigation />
      
      <main className="relative">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
    </BackgroundWrapper>
  )
}

export default App
