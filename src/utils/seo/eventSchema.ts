import type { Event } from '../../services/ticketsCloud'

const VENUE_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Конюшенная площадь, 2В',
  addressLocality: 'Санкт-Петербург',
  addressRegion: 'Санкт-Петербург',
  postalCode: '191186',
  addressCountry: 'RU',
}

const VENUE = {
  '@type': 'MusicVenue',
  name: 'VNVNC Concert Hall',
  address: VENUE_ADDRESS,
  sameAs: [
    'https://www.instagram.com/vnvnc_spb',
    'https://t.me/vnvnc_spb',
    'https://vk.com/vnvnc_spb',
  ],
  url: 'https://vnvnc.ru',
  telephone: '+7 921 410-44-40',
}

type BuildEventJsonLdOptions = {
  canonicalUrl: string
}

const fallbackIso = (value?: Date | string | number): string | undefined => {
  if (!value) return undefined
  const date =
    value instanceof Date ? value : new Date(typeof value === 'number' ? value : value.toString())
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date.toISOString()
}

export const buildEventJsonLd = (event: Event, { canonicalUrl }: BuildEventJsonLdOptions) => {
  const startDateIso = fallbackIso(event.rawDate)

  const offerList =
    event.ticket_types?.map(ticket => ({
      '@type': 'Offer',
      name: ticket.name,
      url: event.purchase_url ?? canonicalUrl,
      price: ticket.price ?? undefined,
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
    })) ?? []

  const sanitizedDescription = (event.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: sanitizedDescription || 'Мероприятие в VNVNC Concert Hall',
    startDate: startDateIso,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url: canonicalUrl,
    image: event.poster_original || event.poster_small || event.image || 'https://vnvnc.ru/og-image.jpg',
    location: VENUE,
    organizer: {
      '@type': 'Organization',
      name: 'VNVNC Concert Hall',
      url: 'https://vnvnc.ru',
      sameAs: [
        'https://www.instagram.com/vnvnc_spb',
        'https://t.me/vnvnc_spb',
      ],
    },
    performer: undefined,
    offers: offerList.length > 0 ? offerList : undefined,
  }
}

export default buildEventJsonLd
