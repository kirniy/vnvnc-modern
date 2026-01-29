import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download as DownloadIcon, RefreshCw, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { colors } from '../utils/colors'
import { fetchPhotoboothPhotos, type PhotoboothPhoto } from '../services/selectelS3'
import BackButton from '../components/BackButton'
import Navigation from '../components/Navigation'
import Seo from '../components/Seo'

const PhotoboothGalleryPage = () => {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState<PhotoboothPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  const loadPhotos = useCallback(async () => {
    setLoading(true)
    const result = await fetchPhotoboothPhotos(200)
    setPhotos(result)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPhotos()
    // Auto-refresh every 30 seconds for live updates during party
    const interval = setInterval(loadPhotos, 30000)
    return () => clearInterval(interval)
  }, [loadPhotos])

  const lightboxSlides = photos.map((p) => ({
    src: p.url,
    download: p.key.split('/').pop() || 'photobooth.png',
  }))

  const downloadPhoto = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      if (blob.size < 100) {
        window.open(url, '_blank')
        return
      }
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo
        title="ФОТОБУДКА — BOILING ROOM | VNVNC"
        description="Фотографии с BOILING ROOM — фотобудка VNVNC"
        canonical="https://vnvnc.ru/gallery/photobooth"
      />
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold lowercase mb-4">
            <span style={{ color: colors.neon.red }}>фотобудка</span>
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto uppercase tracking-widest">
            BOILING ROOM — 30.01 / 31.01
          </p>
          <p className="text-sm text-white/40 mt-2">
            vnvnc · конюшенная, 2в
          </p>

          {/* Back to main gallery */}
          <button
            onClick={() => navigate('/gallery')}
            className="mt-6 inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Основная галерея
          </button>
        </motion.div>

        {/* Photo count + refresh */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-white/40 text-sm">
            {loading ? 'Загрузка...' : `${photos.length} фото`}
          </span>
          <button
            onClick={loadPhotos}
            className="text-white/40 hover:text-white/80 transition-colors p-2"
            title="Обновить"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Photo Grid */}
        {loading && photos.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-32 text-white/40">
            <p className="text-lg mb-2">Пока нет фотографий</p>
            <p className="text-sm">Фотографии появятся здесь во время вечеринки</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.03 } },
            }}
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.key}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 },
                }}
                className="relative aspect-[9/16] overflow-hidden rounded-lg cursor-pointer group bg-white/5"
                onClick={() => {
                  setPhotoIndex(index)
                  setLightboxOpen(true)
                }}
              >
                <img
                  src={photo.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Download hint */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 rounded-full bg-black/60">
                    <DownloadIcon size={16} className="text-white/80" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={photoIndex}
        slides={lightboxSlides}
        styles={{
          container: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          },
        }}
        render={{
          slideFooter: ({ slide }) => {
            const s = slide as any
            const filename = (s.download || 'photobooth.png') as string
            const url = s.src as string

            return (
              <div className="absolute top-4 left-4 flex items-center gap-2 z-30">
                <button
                  onClick={() => downloadPhoto(url, filename)}
                  className="p-3 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                  aria-label="скачать"
                >
                  <DownloadIcon size={22} className="text-white" />
                </button>
              </div>
            )
          },
        }}
        on={{
          view: ({ index }) => setPhotoIndex(index),
        }}
      />
    </div>
  )
}

export default PhotoboothGalleryPage
