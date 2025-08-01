import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Sparkles, Grid3x3, Maximize2 } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { colors } from '../utils/colors'
import DitherBackground from '../components/DitherBackground'

// Gallery images - in a real app, these would come from an API
const galleryImages = [
  { 
    id: 1, 
    src: '/photos/IMG_5014_resized.jpg',
    title: 'Night Vibes',
    category: 'party'
  },
  { 
    id: 2, 
    src: '/photos/IMG_5036_resized.jpg',
    title: 'Dance Floor',
    category: 'party'
  },
  { 
    id: 3, 
    src: '/photos/IMG_5094_resized.jpg',
    title: 'DJ Set',
    category: 'performance'
  },
  { 
    id: 4, 
    src: '/photos/IMG_5126_resized.jpg',
    title: 'Crowd Energy',
    category: 'party'
  },
  { 
    id: 5, 
    src: '/photos/IMG_5730_resized.jpg',
    title: 'Light Show',
    category: 'atmosphere'
  },
  { 
    id: 6, 
    src: '/photos/IMG_5765_resized.jpg',
    title: 'VIP Lounge',
    category: 'interior'
  },
  { 
    id: 7, 
    src: '/photos/IMG_5818_resized.jpg',
    title: 'Concert Night',
    category: 'performance'
  },
  { 
    id: 8, 
    src: '/photos/IMG_5903_resized.jpg',
    title: 'Weekend Vibes',
    category: 'party'
  }
]

const categories = [
  { id: 'all', name: 'Все', icon: Grid3x3 },
  { id: 'party', name: 'Вечеринки', icon: Sparkles },
  { id: 'performance', name: 'Выступления', icon: Camera },
  { id: 'atmosphere', name: 'Атмосфера', icon: Sparkles },
  { id: 'interior', name: 'Интерьер', icon: Camera }
]

const GalleryPage = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredImages = activeCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory)

  const openLightbox = (index: number) => {
    setPhotoIndex(index)
    setLightboxOpen(true)
  }

  return (
    <div className="min-h-screen text-white pt-20 relative">
      <DitherBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-neon-red" size={32} style={{ color: colors.neon.red }} />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Галерея <span style={{ color: colors.neon.red }}>VNVNC</span>
            </h1>
            <Sparkles className="text-neon-red" size={32} style={{ color: colors.neon.red }} />
          </div>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
            Погрузитесь в атмосферу самых запоминающихся вечеров
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === category.id 
                    ? '' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                style={activeCategory === category.id ? {
                  backgroundColor: colors.neon.red,
                  boxShadow: `0 4px 20px ${colors.neon.red}66`
                } : {}}
              >
                <Icon size={18} />
                {category.name}
              </button>
            )
          })}
        </motion.div>

        {/* Gallery Grid - Masonry Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer break-inside-avoid"
              onClick={() => openLightbox(index)}
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{image.title}</h3>
                    <p className="text-white/70 text-sm">{categories.find(c => c.id === image.category)?.name}</p>
                  </div>
                  
                  <div className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md"
                       style={{ backgroundColor: colors.glass.white }}>
                    <Maximize2 size={20} className="text-white" />
                  </div>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                     style={{ 
                       boxShadow: `0 0 30px ${colors.neon.red}44, inset 0 0 30px ${colors.neon.red}22`
                     }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instagram CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <a
            href="https://www.instagram.com/vnvnc_concerthall/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all duration-300"
            style={{ 
              backgroundColor: colors.neon.red,
              boxShadow: `0 4px 20px ${colors.neon.red}66`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 6px 30px ${colors.neon.red}99`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 4px 20px ${colors.neon.red}66`
            }}
          >
            <Camera size={20} />
            <span>Больше фото в Instagram</span>
          </a>
        </motion.div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={photoIndex}
        slides={filteredImages.map(img => ({ src: img.src }))}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
          slide: { cursor: 'grab' },
        }}
      />
    </div>
  )
}

export default GalleryPage