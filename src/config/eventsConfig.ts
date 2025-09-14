export interface EventsConfig {
  sundayFreeDefault: boolean
  forcePaidEventIds: string[]
  forceFreeEventIds: string[]
  titleFreeMatcher: (title?: string) => boolean
}

export const eventsConfig: EventsConfig = {
  // По умолчанию все воскресные события считаются бесплатными
  sundayFreeDefault: true,
  // Список событий, которые ДОЛЖНЫ считаться платными (даже по воскресеньям)
  forcePaidEventIds: [],
  // Список событий, которые ДОЛЖНЫ считаться бесплатными (вне зависимости от дня)
  forceFreeEventIds: [],
  // Условие по названию события: если содержит «все свои» (любой регистр) — считаем бесплатным
  titleFreeMatcher: (title?: string) => {
    if (!title) return false
    const normalized = title.toLowerCase()
    return normalized.includes('все свои')
  }
}

export function isMoscowSunday(dateIso: string | Date | undefined): boolean {
  if (!dateIso) return false
  const base = typeof dateIso === 'string' ? new Date(dateIso) : dateIso
  // Преобразуем к московскому времени и читаем день недели (0=вс)
  const msk = new Date(base.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  return msk.getDay() === 0
}

export function shouldTreatAsFree(eventId?: string, rawDate?: string | Date, title?: string): boolean {
  if (!eventId && !rawDate) return false
  // Жесткие оверрайды
  if (eventId && eventsConfig.forceFreeEventIds.includes(eventId)) return true
  if (eventId && eventsConfig.forcePaidEventIds.includes(eventId)) return false
  // По названию события
  if (eventsConfig.titleFreeMatcher(title)) return true
  if (eventsConfig.sundayFreeDefault && isMoscowSunday(rawDate)) return true
  return false
}


