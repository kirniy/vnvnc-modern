import { motion } from 'framer-motion'
import { FaTelegram } from 'react-icons/fa'
import { Snowflake } from 'lucide-react' // Winter accent
import { colors } from '../utils/colors'

// Winter Telegram Color (Icy Blue)
const TELEGRAM_WINTER_COLOR = '#38bdf8' // sky-400

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
        className="relative p-4 rounded-full shadow-2xl backdrop-blur-md border border-white/40 group overflow-hidden"
        style={{
          backgroundColor: 'rgba(56, 189, 248, 0.8)', // Semi-transparent Sky Blue
          boxShadow: `0 0 40px rgba(56, 189, 248, 0.6), inset 0 0 20px rgba(255,255,255,0.4)`
        }}
      >
        {/* Frost / Texture Overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.8) 100%)' }}
        />

        {/* Pulse animation - Icy */}
        <div
          className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
          style={{
            boxShadow: `0 0 0 0 rgba(56, 189, 248, 0.7)`,
            animation: 'pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
        <style>{`
          @keyframes pulse-blue {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
            70% { transform: scale(1.0); box-shadow: 0 0 0 15px rgba(56, 189, 248, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
          }
        `}</style>

        {/* Icon Container */}
        <div className="relative z-10 flex items-center justify-center">
          <FaTelegram size={28} className="text-white drop-shadow-md relative z-10" />

          {/* Decorative Snowflake behind */}
          <Snowflake
            size={24}
            className="absolute text-white/30 -top-1 -right-2 animate-spin-slow pointer-events-none"
            style={{ animationDuration: '10s' }}
          />
        </div>

        {/* Tooltip on hover - desktop only */}
        <div className="hidden md:block absolute bottom-full right-0 mb-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
          <div
            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap backdrop-blur-md border border-cyan-300/30 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          >
            <span className="text-cyan-200 font-bold tracking-wide">TELEGRAM</span>
            <div
              className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
              style={{ borderTopColor: 'rgba(0,0,0,0.8)' }}
            />
          </div>
        </div>
      </div>

    </motion.a>
  )
}

export default TelegramButton