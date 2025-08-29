import { useEffect, useState } from 'react'
import { colors } from '../utils/colors'

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    onClick: (callback: () => void) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  themeParams: {
    bg_color: string
    text_color: string
    hint_color: string
    link_color: string
    button_color: string
    button_text_color: string
    secondary_bg_color: string
  }
  initData: string
  initDataUnsafe: any
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  isClosingConfirmationEnabled: boolean
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export const useTelegramWebApp = () => {
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      setIsInTelegram(true)
      setWebApp(tg)

      // Initialize Telegram Web App
      tg.ready()
      
      // Expand to full height
      tg.expand()

      // Set dark theme colors to match VNVNC aesthetic (if supported)
      if (tg.setHeaderColor) {
        tg.setHeaderColor(colors.neon.red)  // VNVNC red color (#ff1a1a)
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#000000')
      }

      // Add haptic feedback to clicks
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (!target) return
        
        // Check if clicked element is interactive
        if (
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          (target.classList && target.classList.contains('clickable')) ||
          target.closest('button') ||
          target.closest('a')
        ) {
          // Check if HapticFeedback is available in this version
          if (tg.HapticFeedback && tg.HapticFeedback.impactOccurred) {
            tg.HapticFeedback.impactOccurred('light')
          }
        }
      }

      // Add haptic feedback to hover effects
      const handleHover = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (!target || !target.classList) return
        
        if (
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.classList.contains('hover-haptic')
        ) {
          // Check if HapticFeedback is available in this version
          if (tg.HapticFeedback && tg.HapticFeedback.selectionChanged) {
            tg.HapticFeedback.selectionChanged()
          }
        }
      }

      document.addEventListener('click', handleClick)
      document.addEventListener('mouseenter', handleHover, true)

      // Cleanup
      return () => {
        document.removeEventListener('click', handleClick)
        document.removeEventListener('mouseenter', handleHover, true)
      }
    }
  }, [])

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (webApp) {
      webApp.HapticFeedback.impactOccurred(style)
    }
  }

  const triggerNotification = (type: 'error' | 'success' | 'warning') => {
    if (webApp) {
      webApp.HapticFeedback.notificationOccurred(type)
    }
  }

  const triggerSelection = () => {
    if (webApp) {
      webApp.HapticFeedback.selectionChanged()
    }
  }

  return {
    isInTelegram,
    webApp,
    triggerHaptic,
    triggerNotification,
    triggerSelection,
  }
}