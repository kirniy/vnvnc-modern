import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sizeOf from 'image-size'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')
const OUTPUT_DIR = path.join(DIST_DIR, 'e')
const POSTER_DIR = path.join(OUTPUT_DIR, 'posters')

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://vnvnc.ru'
const API_BASE = (process.env.TICKETSCLOUD_API_BASE || 'https://ticketscloud.com').replace(/\/$/, '')
const API_KEY = process.env.TICKETSCLOUD_API_KEY || 'c862e40ed178486285938dda33038e30'

const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-image.jpg`
const DEFAULT_DESCRIPTION = 'Конюшенная 2В • Культовый клуб в центре Санкт-Петербурга • Здесь всегда атмосферно'
const DEFAULT_TITLE = 'VNVNC Concert Hall'

const pad = value => value.toString().padStart(2, '0')

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const stripHtml = (value = '') =>
  value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const parseSlug = slug => {
  if (!slug) return null
  const parts = slug.split('-')
  if (parts.length < 3) return null

  const [dayStr, monthStr, yearStr, suffix] = parts
  const day = Number(dayStr)
  const month = Number(monthStr)
  const year = Number(yearStr)

  if (
    Number.isNaN(day) ||
    Number.isNaN(month) ||
    Number.isNaN(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return null
  }

  const parsed = {
    day,
    month,
    year: year + 2000,
  }

  if (suffix) {
    if (/^\d{4}$/.test(suffix)) {
      parsed.timeDigits = suffix
    } else {
      parsed.idFragment = suffix
    }
  }

  return parsed
}

const toMoscowDate = date => {
  if (!date) return null
  return new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
}

const getEventDateKey = event => {
  const moscowDate = toMoscowDate(event.eventDate)
  if (!moscowDate) return null
  const year = moscowDate.getFullYear()
  const month = pad(moscowDate.getMonth() + 1)
  const day = pad(moscowDate.getDate())
  return `${year}-${month}-${day}`
}

const buildEventSlug = (event, sameDateCount = 1) => {
  const moscowDate = toMoscowDate(event.eventDate)
  if (!moscowDate) return ''

  const base = `${pad(moscowDate.getDate())}-${pad(moscowDate.getMonth() + 1)}-${moscowDate
    .getFullYear()
    .toString()
    .slice(-2)}`

  if (sameDateCount <= 1) {
    return base
  }

  const timeDigits = (() => {
    if (event.explicitTime && /^\d{4}$/.test(event.explicitTime)) {
      return event.explicitTime
    }
    if (event.hasSpecificTime) {
      const hours = pad(moscowDate.getHours())
      const minutes = pad(moscowDate.getMinutes())
      const combined = `${hours}${minutes}`
      return combined === '0000' ? null : combined
    }
    return null
  })()

  if (timeDigits) {
    return `${base}-${timeDigits}`
  }

  const fragment = event.id?.slice(0, 6)
  return fragment ? `${base}-${fragment}` : base
}

const parseApiEvent = apiEvent => {
  let eventDate
  let hasSpecificTime = false

  const lifetime = apiEvent.lifetime || ''
  const dateTimeMatch = lifetime.match(/DTSTART;VALUE=DATE-TIME:(\d{8}T\d{6})Z/)
  const dateMatch = lifetime.match(/DTSTART;VALUE=DATE:(\d{8})/)

  if (dateTimeMatch) {
    const match = dateTimeMatch[1]
    const year = parseInt(match.substring(0, 4), 10)
    const month = parseInt(match.substring(4, 6), 10) - 1
    const day = parseInt(match.substring(6, 8), 10)
    const hour = parseInt(match.substring(9, 11), 10)
    const minute = parseInt(match.substring(11, 13), 10)
    eventDate = new Date(Date.UTC(year, month, day, hour, minute))
    hasSpecificTime = true
  } else if (dateMatch) {
    const match = dateMatch[1]
    const year = parseInt(match.substring(0, 4), 10)
    const month = parseInt(match.substring(4, 6), 10) - 1
    const day = parseInt(match.substring(6, 8), 10)
    eventDate = new Date(year, month, day)
  }

  const explicitTime = (() => {
    if (!eventDate) return ''
    const moscow = toMoscowDate(eventDate)
    if (!moscow) return ''
    return `${pad(moscow.getHours())}${pad(moscow.getMinutes())}`
  })()

  return {
    id: apiEvent.id,
    title: apiEvent?.title?.text || DEFAULT_TITLE,
    description: stripHtml(apiEvent?.title?.desc || ''),
    eventDate,
    hasSpecificTime,
    explicitTime,
    poster:
      apiEvent?.media?.cover_original?.url ||
      apiEvent?.media?.cover?.url ||
      apiEvent?.media?.cover_small?.url ||
      null,
    fallbackImage: apiEvent?.media?.cover_small?.url || null,
  }
}

const fetchEvents = async () => {
  const response = await fetch(`${API_BASE}/v1/resources/events`, {
    headers: {
      Authorization: `key ${API_KEY}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`TicketsCloud returned ${response.status}`)
  }

  const payload = await response.json()
  const rawEvents = Array.isArray(payload)
    ? payload
    : Object.values(payload || {}).filter(item => item && typeof item === 'object')

  return rawEvents
    .map(parseApiEvent)
    .filter(event => event.eventDate instanceof Date && !Number.isNaN(event.eventDate.getTime()))
}

const formatDescription = event => {
  if (!event) return DEFAULT_DESCRIPTION
  const base = event.description || DEFAULT_DESCRIPTION
  const trimmed = base.slice(0, 180)

  const moscowDate = toMoscowDate(event.eventDate)
  if (moscowDate) {
    const datePart = `${pad(moscowDate.getDate())}.${pad(moscowDate.getMonth() + 1)}.${moscowDate.getFullYear()}`
    const timePart =
      event.hasSpecificTime && !(moscowDate.getHours() === 0 && moscowDate.getMinutes() === 0)
        ? `${pad(moscowDate.getHours())}:${pad(moscowDate.getMinutes())}`
        : null
    const when = [datePart, timePart].filter(Boolean).join(' • ')
    if (when) {
      return `${when} • ${trimmed}`.slice(0, 200)
    }
  }

  return trimmed
}

const buildHtml = ({ slug, event, targetUrl, ogImage, imageWidth, imageHeight }) => {
  const title = event?.title || DEFAULT_TITLE
  const description = formatDescription(event)
  const image = ogImage || event?.poster || event?.fallbackImage || DEFAULT_IMAGE
  const ogUrl = `${SITE_ORIGIN}/e/${slug}`
  const canonical = `${SITE_ORIGIN}/e/${slug}`
  const width = imageWidth || 1200
  const height = imageHeight || 630

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} | VNVNC</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta name="robots" content="noindex,follow" />

  <meta property="og:type" content="event" />
  <meta property="og:url" content="${escapeHtml(ogUrl)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="${width}" />
  <meta property="og:image:height" content="${height}" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:site_name" content="VNVNC Concert Hall" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${targetUrl}');
    }
  </script>
</head>
<body>
  <p>Перенаправляем...</p>
  <noscript>
    <meta http-equiv="refresh" content="3; url=${escapeHtml(targetUrl)}" />
    <p><a href="${escapeHtml(targetUrl)}">Перейти к событию</a></p>
  </noscript>
</body>
</html>
`
}

const ensureDir = async dir => {
  await fs.mkdir(dir, { recursive: true })
}

const writeHtmlVariants = async ({ slug, html }) => {
  await ensureDir(OUTPUT_DIR)
  const baseFile = path.join(OUTPUT_DIR, slug)
  const htmlFile = path.join(OUTPUT_DIR, `${slug}.html`)
  await fs.writeFile(baseFile, html, 'utf8')
  await fs.writeFile(htmlFile, html, 'utf8')
}

const createFallbackPage = async () => {
  const slug = 'event'
  const html = buildHtml({
    slug,
    event: null,
    targetUrl: '/events',
    ogImage: DEFAULT_IMAGE,
  })
  await writeHtmlVariants({ slug, html })
}

const getPosterFilename = (slug, posterUrl) => {
  if (!posterUrl) return `${slug}.jpg`
  try {
    const urlObj = new URL(posterUrl)
    const ext = path.extname(urlObj.pathname) || '.jpg'
    const sanitizedExt = ext.split('?')[0] || '.jpg'
    return `${slug}${sanitizedExt}`
  } catch {
    return `${slug}.jpg`
  }
}

const downloadPoster = async (posterUrl, destination) => {
  const response = await fetch(posterUrl, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to download poster (${response.status})`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await ensureDir(path.dirname(destination))
  await fs.writeFile(destination, buffer)
  return destination
}

async function main() {
  try {
    await fs.rm(OUTPUT_DIR, { recursive: true, force: true })
  } catch {}
  await ensureDir(OUTPUT_DIR)
  await ensureDir(POSTER_DIR)

  let events = []

  try {
    events = await fetchEvents()
  } catch (error) {
    console.error('Failed to fetch events from TicketsCloud:', error)
    console.warn('Generating fallback OG page only.')
    await createFallbackPage()
    return
  }

  if (events.length === 0) {
    console.warn('No events returned from TicketsCloud. Generating fallback OG page.')
    await createFallbackPage()
    return
  }

  const dateCounts = new Map()
  for (const event of events) {
    const key = getEventDateKey(event)
    if (!key) continue
    dateCounts.set(key, (dateCounts.get(key) ?? 0) + 1)
  }

  let successCount = 0

  for (const event of events) {
    const key = getEventDateKey(event)
    const sameDateCount = key ? dateCounts.get(key) ?? 1 : 1
    const slug = buildEventSlug(event, sameDateCount)
    if (!slug) continue

    const targetUrl = `/events/${event.id}`
    let ogImage = event.poster || event.fallbackImage || DEFAULT_IMAGE
    let imageWidth
    let imageHeight

    if (ogImage && ogImage !== DEFAULT_IMAGE) {
      try {
        const filename = getPosterFilename(slug, ogImage)
        const destination = path.join(POSTER_DIR, filename)
        await downloadPoster(ogImage, destination)
        ogImage = `${SITE_ORIGIN}/e/posters/${filename}`

        // Read actual image dimensions
        const imageBuffer = await fs.readFile(destination)
        const dimensions = sizeOf(imageBuffer)
        imageWidth = dimensions.width
        imageHeight = dimensions.height
      } catch (error) {
        console.error('Failed to cache poster locally:', error)
        ogImage = event.poster || event.fallbackImage || DEFAULT_IMAGE
      }
    }

    const html = buildHtml({ slug, event, targetUrl, ogImage, imageWidth, imageHeight })
    await writeHtmlVariants({ slug, html })
    successCount += 1
  }

  if (successCount === 0) {
    console.warn('No OG pages generated. Creating fallback page.')
    await createFallbackPage()
    return
  }

  console.log(`Generated ${successCount} OG pages in ${path.relative(ROOT_DIR, OUTPUT_DIR)}`)
}

main().catch(error => {
  console.error('generate-event-og-pages failed:', error)
  process.exitCode = 1
})
