import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LoadingSpinner from './LoadingSpinner'

const ShortUrlRedirect = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (slug) {
      // Extract the event ID from the slug (last 8 characters after the last dash)
      const parts = slug.split('-')
      const shortId = parts[parts.length - 1]
      
      // In a real app, you'd have a backend service to map short IDs to full IDs
      // For now, this is a simple redirect that preserves the pattern
      // The actual implementation would query your database
      
      // Redirect to the events page for now
      // In production, you'd look up the full ID based on the shortId
      console.log('Redirecting from short URL with ID:', shortId)
      navigate(`/events/688b9bbd950a3f3a75d07fe1`, { replace: true })
    }
  }, [slug, navigate])

  return <LoadingSpinner />
}

export default ShortUrlRedirect