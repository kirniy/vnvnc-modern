import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Ticket } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            VNVNC
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Эпицентр ночной жизни Санкт-Петербурга
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="btn-primary inline-flex items-center space-x-2 px-8 py-4 text-lg"
            >
              <Calendar size={20} />
              <span>Афиша</span>
            </Link>
            
            <Link
              to="/reservations"
              className="inline-flex items-center space-x-2 px-8 py-4 text-lg bg-white text-black border-2 border-white rounded-lg font-medium hover:bg-gray-100 hover:border-gray-200 transition-all duration-300"
            >
              <Ticket size={20} />
              <span>Бронировать стол</span>
            </Link>
          </div>
        </motion.div>

        {/* Location Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 inline-flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
        >
          <MapPin size={16} />
          <span>Конюшенная площадь 2В, Санкт-Петербург</span>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
