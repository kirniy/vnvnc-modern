import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SITE_URL = process.env.SITE_URL?.replace(/\/$/, '') || 'https://vnvnc.ru'
const API_KEY = process.env.TICKETSCLOUD_API_KEY || 'c862e40ed178486285938dda33038e30'
const WORKER_BASE = process.env.TICKETSCLOUD_WORKER?.replace(/\/$/, '') || 'https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api'
const OUTPUT_PATH = path.resolve(__dirname, '../public/sitemap.xml')

const STATIC_ROUTES = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/events', changefreq: 'hourly', priority: 0.9 },
  { loc: '/merch', changefreq: 'weekly', priority: 0.8 },
  { loc: '/gallery', changefreq: 'weekly', priority: 0.8 },
  { loc: '/reservations', changefreq: 'weekly', priority: 0.7 },
  { loc: '/rental', changefreq: 'monthly', priority: 0.6 },
  { loc: '/rules', changefreq: 'monthly', priority: 0.6 },
  { loc: '/contact', changefreq: 'monthly', priority: 0.5 },
]

const parseEventDate = (lifetime = '') => {
  const dateTimeMatch = lifetime.match(/DTSTART;VALUE=DATE-TIME:(\d{8}T\d{6})Z/)
  const dateMatch = lifetime.match(/DTSTART;VALUE=DATE:(\d{8})/)

  if (dateTimeMatch) {
    const [, dateStr] = dateTimeMatch
    const year = Number(dateStr.substring(0, 4))
    const month = Number(dateStr.substring(4, 6)) - 1
    const day = Number(dateStr.substring(6, 8))
    const hour = Number(dateStr.substring(9, 11))
    const minute = Number(dateStr.substring(11, 13))
    return new Date(Date.UTC(year, month, day, hour, minute))
  }

  if (dateMatch) {
    const [, dateStr] = dateMatch
    const year = Number(dateStr.substring(0, 4))
    const month = Number(dateStr.substring(4, 6)) - 1
    const day = Number(dateStr.substring(6, 8))
    return new Date(year, month, day)
  }

  return undefined
}

const buildUrlNode = ({ loc, lastmod, changefreq, priority }) => {
  const iso = lastmod ? new Date(lastmod).toISOString().split('T')[0] : undefined
  const parts = [
    '  <url>',
    `    <loc>${SITE_URL}${loc}</loc>`,
    iso ? `    <lastmod>${iso}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    typeof priority === 'number' ? `    <priority>${priority.toFixed(1)}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')

  return parts
}

const fetchEvents = async () => {
  try {
    const response = await fetch(`${WORKER_BASE}/v1/resources/events?key=${API_KEY}`)

    if (!response.ok) {
      throw new Error(`TicketsCloud worker responded with ${response.status}`)
    }

    const data = await response.json()
    const events = Array.isArray(data) ? data : Object.values(data)
    return events
      .filter(event => event && typeof event === 'object')
      .map(event => {
        const startDate = parseEventDate(event.lifetime)
        const lastmod = startDate ?? new Date()
        const isUpcoming = startDate ? startDate > new Date() : false

        return {
          id: event.id,
          lastmod: lastmod.toISOString(),
          loc: `/events/${event.id}`,
          priority: isUpcoming ? 0.9 : 0.5,
          changefreq: isUpcoming ? 'daily' : 'monthly',
          sortValue: lastmod.getTime(),
        }
      })
      .sort((a, b) => b.sortValue - a.sortValue)
  } catch (error) {
    console.error('[sitemap] Failed to fetch events:', error)
    return []
  }
}

const buildSitemap = async () => {
  const [eventUrls] = await Promise.all([fetchEvents()])

  const urls = [...STATIC_ROUTES, ...eventUrls]
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(buildUrlNode),
    '</urlset>',
    '',
  ].join('\n')

  await fs.writeFile(OUTPUT_PATH, xml, 'utf-8')
  console.log(`[sitemap] Wrote ${urls.length} URLs to ${OUTPUT_PATH}`)
}

buildSitemap().catch(error => {
  console.error('[sitemap] Unhandled error', error)
  process.exitCode = 1
})
