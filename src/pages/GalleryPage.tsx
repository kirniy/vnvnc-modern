import { motion } from 'framer-motion'
import { Camera, Sparkles } from 'lucide-react'
import RollingGallery from '../components/RollingGallery'

const GalleryPage = () => {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-red-500" size={32} />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Галерея 
              <span className="text-red-500">VNVNC</span>
            </h1>
            <Sparkles className="text-red-500" size={32} />
          </div>
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto">
            Погрузитесь в атмосферу самых запоминающихся вечеров
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Специальные моменты
            </h2>
            <p className="text-white text-lg max-w-2xl mx-auto">
              Откройте для себя уникальные кадры с наших мероприятий
            </p>
          </motion.div>

          <div className="mb-16">
            <RollingGallery 
              autoplay={true} 
              pauseOnHover={true} 
            />
          </div>

          <div className="mt-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors cursor-pointer"
            >
              <Camera size={20} />
              <span>Посмотреть все фото</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GalleryPage
