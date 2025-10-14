export const getDayOfWeek = (dateString: string): string => {
  // This function is now deprecated - use toLocaleDateString with timeZone instead
  // Keeping for backward compatibility
  const months: { [key: string]: number } = {
    'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
    'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
    'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
  }
  
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  
  // Remove any extra spaces and normalize
  const normalizedDate = dateString.trim().replace(/\s+/g, ' ')
  
  // Try multiple date formats
  // Format 1: "1 августа 2025 г." or "1 августа 2025"
  let match = normalizedDate.match(/(\d+)\s+([а-яё]+)\s+(\d{4})/i)
  let day, month, year
  
  if (match) {
    day = parseInt(match[1])
    month = months[match[2].toLowerCase()]
    year = parseInt(match[3])
  } else {
    // Format 2: "1 августа"
    match = normalizedDate.match(/(\d+)\s+([а-яё]+)/i)
    if (!match) return ''
    
    day = parseInt(match[1])
    month = months[match[2].toLowerCase()]
    year = new Date().getFullYear()
  }
  
  if (month === undefined) return ''
  
  const date = new Date(year, month, day)
  const dayOfWeek = date.getDay()
  
  return days[dayOfWeek]
}

export const getShortDayOfWeek = (dateString: string): string => {
  // This function is now deprecated - use toLocaleDateString with timeZone instead
  // Keeping for backward compatibility
  const months: { [key: string]: number } = {
    'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
    'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
    'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
  }
  
  const shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  
  // Remove any extra spaces and normalize
  const normalizedDate = dateString.trim().replace(/\s+/g, ' ')
  
  // Try multiple date formats
  // Format 1: "1 августа 2025 г." or "1 августа 2025"
  let match = normalizedDate.match(/(\d+)\s+([а-яё]+)\s+(\d{4})/i)
  let day, month, year
  
  if (match) {
    day = parseInt(match[1])
    month = months[match[2].toLowerCase()]
    year = parseInt(match[3])
  } else {
    // Format 2: "1 августа"
    match = normalizedDate.match(/(\d+)\s+([а-яё]+)/i)
    if (!match) return ''
    
    day = parseInt(match[1])
    month = months[match[2].toLowerCase()]
    year = new Date().getFullYear()
  }
  
  if (month === undefined) return ''
  
  const date = new Date(year, month, day)
  const dayOfWeek = date.getDay()
  
  return shortDays[dayOfWeek]
}

// Returns true if the given date falls within the Halloween period of the current year
// Period (inclusive): Oct 31 – Nov 3 in Europe/Moscow timezone
export function isInHalloween(dateIso?: string | Date): boolean {
  if (!dateIso) return false
  const base = typeof dateIso === 'string' ? new Date(dateIso) : dateIso
  // Convert to Moscow date components
  const msk = new Date(base.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  const year = msk.getFullYear()
  const start = new Date(Date.UTC(year, 9, 31, 0, 0, 0)) // Oct is 9
  const end = new Date(Date.UTC(year, 10, 3, 23, 59, 59)) // Nov is 10
  // Convert start/end into Moscow time-equivalent moments for comparison by normalizing to local time
  const mskStart = new Date(new Date(start).toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  const mskEnd = new Date(new Date(end).toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  return msk >= mskStart && msk <= mskEnd
}