/**
 * Tickets Cloud API Integration
 * 
 * Based on official documentation:
 * - Base URLs: prod "https://ticketscloud.com", stage "https://stage.freetc.net"
 * - Authentication: "Authorization: key YOUR_API_KEY" (not Bearer token)
 * - Format: JSON REST API
 * - Endpoints:
 *   - GET /v1/resources/events - List events with filtering
 *   - GET /v1/resources/events/{id} - Get specific event details
 * 
 * CORS Note: The API does not support CORS for browser requests.
 * This service uses a custom Cloudflare Worker as CORS proxy.
 */

interface TicketsCloudConfig {
  apiKey: string
  useStage?: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  price: string
  image: string
  attendees: number
  venue?: string
  status?: string
  age_rating?: number
  poster_original?: string
  poster_small?: string
  widget_available?: boolean
  purchase_url?: string
  rawDate: Date
  hasPrice: boolean
  eventTimestamp?: number
  ticket_types?: Array<{
    id: string
    name: string
    price: number
    available: number
    total: number
  }>
}

interface ApiEvent {
  id: string
  created_at: string
  updated_at: string
  org: string
  lifetime: string
  open_date: boolean
  status: string
  map: any
  removed: boolean
  allow_to_remove: boolean
  tickets_limit: number | null
  sponsored_by_mts: boolean
  lang_switcher: boolean
  title: {
    text: string
    desc: string
  }
  venue?: string
  age_rating?: number
  artists?: string[]
  tags?: string[]
  category?: string
  media?: {
    cover_original?: {
      id: string
      url: string
      content_type: string
    }
    cover?: {
      id: string
      url: string
      content_type: string
    }
    cover_small?: {
      id: string
      url: string
      content_type: string
    }
  }
  view_limits?: {
    api: boolean
    salespoint: boolean
    showroom: boolean
    widget: boolean
  }
  ticket_types?: Array<{
    id: string
    name: string
    price_min: number
    price_max: number
    currency: string
  }>
}

class TicketsCloudService {
  private apiKey: string

  constructor(config: TicketsCloudConfig) {
    this.apiKey = config.apiKey
  }

  private async makeRequest(endpoint: string) {
    // Always use the CORS proxy to avoid issues
    try {
      const workerUrl = `https://vnvnc-cors-proxy.kirlich-ps3.workers.dev/api${endpoint}?key=${this.apiKey}`
      console.log('Using Cloudflare Worker proxy:', workerUrl)

      const response = await fetch(workerUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Worker proxy error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Cloudflare Worker proxy successful')
      return data
    } catch (error) {
      console.error('❌ Cloudflare Worker proxy failed:', error)
      throw new Error('Failed to fetch from TicketsCloud API via worker proxy.')
    }
  }

  private formatApiEvent(apiEvent: ApiEvent): Event {
    // Parse the lifetime field to extract event date/time
    let eventDate: Date | undefined
    let eventTimestamp: number | undefined

    const dateTimeMatch = apiEvent.lifetime.match(/DTSTART;VALUE=DATE-TIME:(\d{8}T\d{6})Z/)
    const dateMatch = apiEvent.lifetime.match(/DTSTART;VALUE=DATE:(\d{8})/)

    if (dateTimeMatch) {
      const dateStr = dateTimeMatch[1]
      const year = parseInt(dateStr.substring(0, 4))
      const month = parseInt(dateStr.substring(4, 6)) - 1
      const day = parseInt(dateStr.substring(6, 8))
      const hour = parseInt(dateStr.substring(9, 11))
      const minute = parseInt(dateStr.substring(11, 13))
      eventDate = new Date(Date.UTC(year, month, day, hour, minute))
      eventTimestamp = eventDate.getTime()
    } else if (dateMatch) {
      const dateStr = dateMatch[1]
      const year = parseInt(dateStr.substring(0, 4))
      const month = parseInt(dateStr.substring(4, 6)) - 1
      const day = parseInt(dateStr.substring(6, 8))
      eventDate = new Date(year, month, day) // Local midnight
      eventTimestamp = eventDate.getTime()
    }
    
    // Use smaller images for list view, save original for detail view
    const posterImage = apiEvent.media?.cover?.url ||  // Medium size first
                       apiEvent.media?.cover_small?.url || 
                       apiEvent.media?.cover_original?.url || 
                       '/default-event.jpg'
    
    const prices = apiEvent.ticket_types?.map(t => t.price_min ?? t.price_max).filter(p => p != null) || []

    return {
      id: apiEvent.id,
      title: apiEvent.title.text,
      description: (() => {
        const rawDesc = apiEvent.title.desc || 'Описание не указано';
        const descHTML = rawDesc
          .replace(/\r?\n/g, '<br>')
          .replace(/<br>\s*<br>/g, '<br>');
        return descHTML.replace(/<script/gi, '&lt;script');
      })(),
      date: eventDate ? eventDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Moscow'
      }) : 'Дата не указана',
      time: '',
      location: '',
      price: '',
      image: posterImage,
      attendees: 0,
      venue: 'VNVNC',
      status: apiEvent.status,
      age_rating: apiEvent.age_rating,
      poster_original: apiEvent.media?.cover_original?.url,
      poster_small: apiEvent.media?.cover_small?.url,
      widget_available: apiEvent.view_limits?.widget || false,
      purchase_url: `https://ticketscloud.com/v2/event/${apiEvent.id}`,
      rawDate: eventDate || new Date(0), // Provide a fallback date
      hasPrice: prices.length > 0,
      eventTimestamp: eventTimestamp,
      ticket_types: apiEvent.ticket_types?.map(t => ({
        id: t.id,
        name: t.name,
        price: t.price_min,
        available: 0,
        total: 0
      }))
    }
  }

  async getEvents(params: {
    city_id?: number
    status?: 'active' | 'finished' | 'postponed' | 'cancelled'
    from?: string
    to?: string
    page?: number
    per_page?: number
  } = {}): Promise<Event[]> {
    try {
      // v1 API has limited parameter support
      const query = new URLSearchParams()
      
      // Only add supported parameters to avoid API errors
      if (params.city_id) query.append('city_id', params.city_id.toString())
      if (params.status) query.append('status', params.status)

      const endpoint = `/v1/resources/events${query.toString() ? `?${query.toString()}` : ''}`
      const response = await this.makeRequest(endpoint)
      
      // v1 API returns object with numbered keys (0, 1, 2, etc.)
      const events = Object.values(response).filter(event => event && typeof event === 'object') as ApiEvent[]
      const formattedEvents = events.map(this.formatApiEvent)
      return formattedEvents.sort((a, b) => (a.eventTimestamp ?? Infinity) - (b.eventTimestamp ?? Infinity))
    } catch (error) {
      console.error('Failed to fetch events:', error)
      return this.getMockEvents()
    }
  }

  async getEventDetails(eventId: string): Promise<Event | null> {
    try {
      // Using working v1 endpoint: GET /v1/resources/events/{event_id}
      const response = await this.makeRequest(`/v1/resources/events/${eventId}`)
      return this.formatApiEvent(response as ApiEvent)
    } catch (error) {
      console.error('Failed to fetch event details:', error)
      return this.getMockEventDetails(eventId)
    }
  }

  async searchEvents(query: string, filters: {
    city_ids?: number[]
    category?: string
    price_min?: number
    price_max?: number
  } = {}): Promise<Event[]> {
    try {
      // Use v1 events endpoint with title search filter
      const queryParams = new URLSearchParams()
      if (query) queryParams.append('title', query)
      if (filters.city_ids && filters.city_ids.length > 0) {
        queryParams.append('city_id', filters.city_ids[0].toString())
      }
      
      const endpoint = `/v1/resources/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await this.makeRequest(endpoint)
      
      // v1 API returns object with numbered keys (0, 1, 2, etc.)
      const events = Object.values(response).filter(event => event && typeof event === 'object') as ApiEvent[]
      const formattedEvents = events.map(this.formatApiEvent)
      return formattedEvents.sort((a, b) => (a.eventTimestamp ?? Infinity) - (b.eventTimestamp ?? Infinity))
    } catch (error) {
      console.error('Failed to search events:', error)
      return this.getMockEvents().filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
      )
    }
  }


  // Mock data for development/fallback
  private getMockEvents(): Event[] {
    return [
      {
        id: '1',
        title: 'TECHNO NIGHT',
        description: 'Легендарная техно вечеринка с лучшими диджеями города',
        date: '15 Декабря 2024',
        time: '23:00',
        location: 'VNVNC Concert Hall',
        price: 'от 1500₽',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        attendees: 450,
        rawDate: new Date('2024-12-15T23:00:00'),
        hasPrice: true
      },
      {
        id: '2',
        title: 'HOUSE MUSIC FESTIVAL',
        description: 'Фестиваль хаус музыки с международными артистами',
        date: '22 Декабря 2024',
        time: '22:00',
        location: 'VNVNC Concert Hall',
        price: 'от 2000₽',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        attendees: 680,
        rawDate: new Date('2024-12-22T22:00:00'),
        hasPrice: true
      },
      {
        id: '3',
        title: 'DRUM & BASS NIGHT',
        description: 'Энергичный drum & bass вечер с топовыми MC',
        date: '29 Декабря 2024',
        time: '23:30',
        location: 'VNVNC Concert Hall',
        price: 'от 1200₽',
        image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
        attendees: 320,
        rawDate: new Date('2024-12-29T23:30:00'),
        hasPrice: true
      }
    ]
  }

  private getMockEventDetails(eventId: string): Event | null {
    const events = this.getMockEvents()
    return events.find(event => event.id === eventId) || null
  }
}

// Create service instance with your actual API key
export const ticketsCloudService = new TicketsCloudService({
  apiKey: 'c862e40ed178486285938dda33038e30',
  useStage: false
})

export default TicketsCloudService
