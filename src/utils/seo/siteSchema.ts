const SITE_URL = 'https://vnvnc.ru'

const BASE_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Конюшенная площадь, 2В',
  addressLocality: 'Санкт-Петербург',
  addressRegion: 'Санкт-Петербург',
  postalCode: '191186',
  addressCountry: 'RU',
}

const SOCIAL_LINKS = [
  'https://vk.com/vnvnc_spb',
  'https://www.instagram.com/vnvnc_spb',
  'https://t.me/vnvnc_spb',
]

export const buildLocalBusinessJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'NightClub',
  '@id': `${SITE_URL}#nightclub`,
  name: 'VNVNC Concert Hall',
  alternateName: ['Виновница', 'VNVNC'],
  url: SITE_URL,
  image: `${SITE_URL}/og-image.jpg`,
  telephone: '+7 921 410-44-40',
  address: BASE_ADDRESS,
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 59.9398,
    longitude: 30.3234,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Friday', 'Saturday', 'Sunday'],
      opens: '23:00',
      closes: '07:00',
    },
  ],
  priceRange: '$$',
  acceptsReservations: true,
  sameAs: SOCIAL_LINKS,
})

type BreadcrumbItem = {
  name: string
  url: string
}

export const buildBreadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

type FaqEntry = {
  question: string
  answer: string
}

export const buildFaqJsonLd = (entries: FaqEntry[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: entries.map(entry => ({
    '@type': 'Question',
    name: entry.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: entry.answer,
    },
  })),
})

export const createBreadcrumbTrail = (segments: BreadcrumbItem[]) => [
  { name: 'Главная', url: SITE_URL },
  ...segments,
]

export const SITE_BASE_URL = SITE_URL

type VideoObjectOptions = {
  name: string
  description: string
  thumbnailUrl: string
  contentUrl: string
  uploadDate: string
  duration?: string
  embedUrl?: string
}

export const buildVideoObjectJsonLd = ({
  name,
  description,
  thumbnailUrl,
  contentUrl,
  uploadDate,
  duration,
  embedUrl,
}: VideoObjectOptions) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name,
  description,
  thumbnailUrl,
  contentUrl,
  uploadDate,
  duration,
  embedUrl,
  publisher: {
    '@type': 'Organization',
    name: 'VNVNC Concert Hall',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
  },
})
