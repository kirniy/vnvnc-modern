import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { colors } from '../utils/colors'

const WhatsAppButton = () => {
  const phoneNumber = '79214104440' // Remove + for WhatsApp link
  const message = encodeURIComponent('Здравствуйте! Хочу забронировать стол в VNVNC')
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div 
        className="relative p-4 rounded-full shadow-2xl backdrop-blur-md border border-white/20"
        style={{ 
          backgroundColor: '#25D366',
          boxShadow: '0 0 30px rgba(37, 211, 102, 0.5)'
        }}
      >
        {/* Pulse animation */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: '#25D366' }}
        />
        
        {/* Icon */}
        <FaWhatsapp size={28} className="text-white relative z-10" />
        
        {/* Tooltip on hover - desktop only */}
        <div className="hidden md:block absolute bottom-full right-0 mb-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
          <div 
            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap backdrop-blur-md border border-white/20"
            style={{ backgroundColor: colors.glass.dark }}
          >
            <span className="text-white">Забронировать стол</span>
            <div 
              className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
              style={{ borderTopColor: colors.glass.dark }}
            />
          </div>
        </div>
      </div>
      
      {/* Mobile-specific text label */}
      <motion.div 
        className="md:hidden absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div 
          className="px-3 py-1 rounded-full text-xs backdrop-blur-md border border-white/20"
          style={{ backgroundColor: colors.glass.dark }}
        >
          <span className="text-white">Быстрая бронь</span>
        </div>
      </motion.div>
    </motion.a>
  )
}

export default WhatsAppButton