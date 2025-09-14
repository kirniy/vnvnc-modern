import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    ym?: (...args: any[]) => void
    _tmr?: any[]
    dataLayer?: any[]
  }
}

const sendPageView = (pathname: string) => {
  try {
    // Yandex Metrika SPA hit
    if (typeof window.ym === 'function') {
      window.ym(104148318, 'hit', pathname)
    }
    // Top.Mail.Ru page view
    if (Array.isArray(window._tmr)) {
      window._tmr.push({ id: '3687728', type: 'pageView', url: pathname, start: Date.now() })
    }
  } catch (e) {
    // no-op
  }
}

export const trackTicketClick = (payload: { eventId?: string; title?: string; source?: string }) => {
  try {
    // Yandex Metrika reachGoal
    if (typeof window.ym === 'function') {
      window.ym(104148318, 'reachGoal', 'ticket_click', payload)
    }
    // Top.Mail.Ru custom event
    if (Array.isArray(window._tmr)) {
      window._tmr.push({ id: '3687728', type: 'reachGoal', goal: 'ticket_click', params: payload })
    }
    // e-commerce-like layer if needed
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'ticket_click', ...payload })
  } catch (e) {
    // no-op
  }
}

const AnalyticsTracker = () => {
  const location = useLocation()

  useEffect(() => {
    sendPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  return null
}

export default AnalyticsTracker


