import { motion } from 'framer-motion'
import { FaTelegram } from 'react-icons/fa'
import { colors } from '../utils/colors'

// Telegram brand color
const TELEGRAM_COLOR = '#229ED9'

const TelegramButton = () => {
  // Telegram direct message link to @vnvnc_spb
  const telegramUsername = 'vnvnc_spb'
  const telegramUrl = `https://t.me/${telegramUsername}`

  return (
    <motion.a
      href={telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[80] md:bottom-8 md:right-8"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div 
        className="relative p-4 rounded-full shadow-2xl backdrop-blur-md border border-white/20"
        style={{ 
          backgroundColor: TELEGRAM_COLOR,
          boxShadow: `0 0 30px rgba(34, 158, 217, 0.5)`
        }}
      >
        {/* Pulse animation - slower and contained */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
          style={{ 
            backgroundColor: TELEGRAM_COLOR,
            animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
        
        {/* Icon */}
        <FaTelegram size={28} className="text-white relative z-10" />
        
        {/* Tooltip on hover - desktop only */}
        <div className="hidden md:block absolute bottom-full right-0 mb-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
          <div 
            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap backdrop-blur-md border border-white/20"
            style={{ backgroundColor: colors.glass.dark }}
          >
            <span className="text-white">Написать в Telegram</span>
            <div 
              className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
              style={{ borderTopColor: colors.glass.dark }}
            />
          </div>
        </div>
      </div>
      
    </motion.a>
  )
}

export default TelegramButton