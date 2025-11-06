import type { Event } from '../services/ticketsCloud'

const pad = (value: number) => value.toString().padStart(2, '0')

const BASE_YEAR = 2000

export interface BuildEventSlugOptions {
  sameDateCount?: number
  forceIncludeTime?: boolean
}

export interface ParsedEventSlug {
  day: number
  month: number
  year: number
  timeDigits?: string
  idFragment?: string
}

/**
 * Produces a YYYY-MM-DD key for grouping events that happen on the same Moscow calendar day.
 */
export const getEventDateKey = (event: Pick<Event, 'rawDate'>): string | null => {
  if (!event?.rawDate) return null

  const rawDate = new Date(event.rawDate)
  const moscowDate = new Date(
    rawDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }),
  )

  const year = moscowDate.getFullYear()
  const month = pad(moscowDate.getMonth() + 1)
  const day = pad(moscowDate.getDate())

  return `${year}-${month}-${day}`
}

/**
 * Builds a short, mostly human-friendly slug for an event.
 * Default format: DD-MM-YY. When there are multiple events on the same date (or forced),
 * we append -HHMM (24h) if time is known, otherwise we fall back to a short event id fragment.
 */
export const buildEventSlug = (
  event: Event,
  options: BuildEventSlugOptions = {},
): string => {
  if (!event?.rawDate) {
    return ''
  }

  const rawDate = new Date(event.rawDate)
  const moscowDate = new Date(
    rawDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }),
  )

  const day = pad(moscowDate.getDate())
  const month = pad(moscowDate.getMonth() + 1)
  const yearShort = moscowDate.getFullYear().toString().slice(-2)
  const baseSlug = `${day}-${month}-${yearShort}`

  const sameDateCount = options.sameDateCount ?? 1
  const shouldIncludeTime =
    options.forceIncludeTime ?? sameDateCount > 1

  if (!shouldIncludeTime) {
    return baseSlug
  }

  const timeDigits = (() => {
    const sanitized = event.time?.replace(':', '')
    if (sanitized && /^\d{4}$/.test(sanitized)) {
      return sanitized
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
    return `${baseSlug}-${timeDigits}`
  }

  const idFragment = event.id?.slice(0, 6)
  return idFragment ? `${baseSlug}-${idFragment}` : baseSlug
}

/**
 * Parses a slug in format DD-MM-YY, DD-MM-YY-HHMM or DD-MM-YY-<idPrefix>.
 */
export const parseEventSlug = (slug: string): ParsedEventSlug | null => {
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

  const result: ParsedEventSlug = {
    day,
    month,
    year: year + BASE_YEAR,
  }

  if (suffix) {
    if (/^\d{4}$/.test(suffix)) {
      result.timeDigits = suffix
    } else {
      result.idFragment = suffix
    }
  }

  return result
}
