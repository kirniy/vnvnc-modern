import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../services/ticketsCloud'
import LoadingSpinner from './LoadingSpinner'

const ShortUrlRedirect = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  // Fetch all events to find the one matching the date
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => ticketsCloudService.getEvents({}),
    enabled: !!slug
  })

  useEffect(() => {
    if (slug && events.length > 0) {
      // The slug is now just a date in format DD-MM-YY
      // We need to find an event that matches this date
      const [day, month, year] = slug.split('-')
      
      // Convert to full year (e.g., 25 -> 2025)
      const fullYear = parseInt(year) + 2000
      
      // Find events that match this date
      const matchingEvent = events.find(event => {
        if (!event.rawDate) return false
        
        const eventDate = new Date(event.rawDate)
        // Use Moscow timezone to compare dates
        const moscowDate = new Date(eventDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
        
        return moscowDate.getDate() === parseInt(day) &&
               moscowDate.getMonth() + 1 === parseInt(month) &&
               moscowDate.getFullYear() === fullYear
      })
      
      if (matchingEvent) {
        navigate(`/events/${matchingEvent.id}`, { replace: true })
      } else {
        // If no event found for this date, redirect to events page
        console.log('No event found for date:', slug)
        navigate('/events', { replace: true })
      }
    }
  }, [slug, events, navigate])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return <LoadingSpinner />
}

export default ShortUrlRedirect