import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../services/ticketsCloud'
import LoadingSpinner from './LoadingSpinner'
import EventDetailPage from '../pages/EventDetailPage'
import { buildEventSlug, getEventDateKey, parseEventSlug } from '../utils/eventSlug'

const ShortUrlRedirect = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [eventId, setEventId] = useState<string | null>(null)

  // Fetch all events to find the one matching the date
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => ticketsCloudService.getEvents({}),
    enabled: !!slug
  })

  const dateCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const event of events) {
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

  useEffect(() => {
    if (!slug || events.length === 0) return

    // First try an exact slug match using the new slug generator
    const directMatch = events.find(
      event => buildEventSlug(event, { sameDateCount: getSameDateCount(event) }) === slug
    )
    if (directMatch) {
      setEventId(directMatch.id)
      return
    }

    // Try to parse legacy format (DD-MM-YY) or extended DD-MM-YY-HHMM
    const parsed = parseEventSlug(slug)
    if (parsed) {
      const { day, month, year, timeDigits, idFragment } = parsed
      const candidates = events.filter(event => {
        if (!event.rawDate) return false
        const eventDate = new Date(event.rawDate)
        const moscowDate = new Date(
          eventDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
        )
        return (
          moscowDate.getDate() === day &&
          moscowDate.getMonth() + 1 === month &&
          moscowDate.getFullYear() === year
        )
      })

      if (timeDigits) {
        const timeMatch = candidates.find(event => {
          const slugForEvent = buildEventSlug(event, { sameDateCount: getSameDateCount(event) })
          return slugForEvent.endsWith(`-${timeDigits}`)
        })
        if (timeMatch) {
          setEventId(timeMatch.id)
          return
        }
      }

      if (idFragment) {
        const idMatch = candidates.find(event => event.id.startsWith(idFragment))
        if (idMatch) {
          setEventId(idMatch.id)
          return
        }
      }

      if (candidates.length > 0) {
        setEventId(candidates[0].id)
        return
      }
    }

    // Fallback: allow direct linking by (partial) event id
    const idMatch = events.find(event => event.id === slug || event.id.startsWith(slug))
    if (idMatch) {
      setEventId(idMatch.id)
      return
    }

    // If no event found for this slug, redirect to events page
    navigate('/events', { replace: true })
  }, [slug, events, navigate, dateCounts])

  if (isLoading) {
    return <LoadingSpinner />
  }

  // If we found a matching event, render the EventDetailPage with that ID
  if (eventId) {
    return <EventDetailPage eventIdOverride={eventId} />
  }

  return <LoadingSpinner />
}

export default ShortUrlRedirect
