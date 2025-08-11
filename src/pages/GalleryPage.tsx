import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Sparkles, Maximize2, RefreshCw, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Download from 'yet-another-react-lightbox/plugins/download'
import 'yet-another-react-lightbox/styles.css'
import { colors } from '../utils/colors'
import { useInfiniteYandexPhotos, useYandexDates } from '../hooks/useYandexPhotos'
import LoadingSpinner from '../components/LoadingSpinner'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

// Fallback images - used when Yandex Disk is unavailable
const fallbackImages = [
  { 
    id: '1', 
    src: '/photos/IMG_5014_resized.jpg',
    title: 'Night Vibes',
    category: 'party',
    date: undefined,
    name: 'IMG_5014_resized.jpg',
    path: '/photos/IMG_5014_resized.jpg'
  },
  { 
    id: '2', 
    src: '/photos/IMG_5036_resized.jpg',
    title: 'Dance Floor',
    category: 'party',
    date: undefined,
    name: 'IMG_5036_resized.jpg',
    path: '/photos/IMG_5036_resized.jpg'
  },
  { 
    id: '3', 
    src: '/photos/IMG_5094_resized.jpg',
    title: 'DJ Set',
    category: 'performance',
    date: undefined,
    name: 'IMG_5094_resized.jpg',
    path: '/photos/IMG_5094_resized.jpg'
  },
  { 
    id: '4', 
    src: '/photos/IMG_5126_resized.jpg',
    title: 'Crowd Energy',
    category: 'party',
    date: undefined,
    name: 'IMG_5126_resized.jpg',
    path: '/photos/IMG_5126_resized.jpg'
  },
  { 
    id: '5', 
    src: '/photos/IMG_5730_resized.jpg',
    title: 'Light Show',
    category: 'atmosphere',
    date: undefined,
    name: 'IMG_5730_resized.jpg',
    path: '/photos/IMG_5730_resized.jpg'
  },
  { 
    id: '6', 
    src: '/photos/IMG_5765_resized.jpg',
    title: 'VIP Lounge',
    category: 'interior',
    date: undefined,
    name: 'IMG_5765_resized.jpg',
    path: '/photos/IMG_5765_resized.jpg'
  },
  { 
    id: '7', 
    src: '/photos/IMG_5818_resized.jpg',
    title: 'Concert Night',
    category: 'performance',
    date: undefined,
    name: 'IMG_5818_resized.jpg',
    path: '/photos/IMG_5818_resized.jpg'
  },
  { 
    id: '8', 
    src: '/photos/IMG_5903_resized.jpg',
    title: 'Weekend Vibes',
    category: 'party',
    date: undefined,
    name: 'IMG_5903_resized.jpg',
    path: '/photos/IMG_5903_resized.jpg'
  }
]

// Helper function to format date from YYYY-MM-DD to DD.MM.YY
const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const shortYear = year.slice(-2);
  return `${day}.${month}.${shortYear}`;
}

// Get short month name in Russian
const getShortMonthName = (month: string): string => {
  const months: { [key: string]: string } = {
    '01': 'янв',
    '02': 'фев',
    '03': 'мар',
    '04': 'апр',
    '05': 'май',
    '06': 'июн',
    '07': 'июл',
    '08': 'авг',
    '09': 'сен',
    '10': 'окт',
    '11': 'ноя',
    '12': 'дек'
  };
  return months[month] || '';
}

const GalleryPage = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch all available dates from Yandex Disk
  const { data: allDates = [] } = useYandexDates()

  // Auto-select latest date on first load
  useEffect(() => {
    if (!useFallback && allDates.length > 0 && selectedDate === null) {
      setSelectedDate(allDates[0])
    }
  }, [allDates, selectedDate, useFallback])

  // Fetch photos from Yandex Disk with infinite scrolling
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteYandexPhotos('all', selectedDate ? 200 : 12, selectedDate || undefined)

  // Set up intersection observer for infinite scrolling
  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    // Disable infinite scroll when a specific date album is selected
    enabled: !isLoading && !isError && hasNextPage && !selectedDate
  })

  // Use fallback images if Yandex Disk fails
  useEffect(() => {
    if (isError) {
      setUseFallback(true)
    }
  }, [isError])

  // Combine all pages of photos or use fallback
  const allPhotos = useFallback 
    ? fallbackImages 
    : data?.pages.flatMap(page => page.photos) || []

  // Use all dates fetched from the API (already sorted newest first)
  const uniqueDates = allDates;

  // Filter and sort images based on date
  const filteredImages = useMemo(() => {
    let images = allPhotos;

    // Фильтрация по дате теперь делает сервер — оставим на случай локального fallback
    if (useFallback && selectedDate) {
      images = images.filter(img => img.date === selectedDate);
    }

    // Sort by date (newest first) - photos should already be sorted from backend, but ensure it here
    images = [...images].sort((a, b) => {
      if (a.date && b.date) {
        return b.date.localeCompare(a.date);
      }
      return 0;
    });

    return images;
  }, [allPhotos, selectedDate]);

  const openLightbox = (index: number) => {
    setPhotoIndex(index)
    setLightboxOpen(true)
  }

  // Retry loading from Yandex Disk
  const handleRetry = () => {
    setUseFallback(false)
    window.location.reload()
  }

  // Scroll date selector
  const scrollDates = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  // API base for download links
  const API_BASE_URL = import.meta.env.PROD
    ? 'https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev'
    : 'http://localhost:8787'

  return (
    <div className="min-h-screen text-white pt-16 sm:pt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-neon-red" size={32} style={{ color: colors.neon.red }} />
            <h1 className="text-4xl md:text-6xl font-display font-extrabold lowercase text-stretch-heading">
              галерея <span style={{ color: colors.neon.red }}>vnvnc</span>
            </h1>
            <Sparkles className="text-neon-red" size={32} style={{ color: colors.neon.red }} />
          </div>
          <p className="text-base md:text-xl text-white/80 max-w-2xl mx-auto text-stretch-body">
            Погрузитесь в атмосферу самых запоминающихся вечеров
          </p>
        </motion.div>

        {/* Compact Date Selector */}
        {uniqueDates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 relative"
          >
            <div className="flex items-center gap-2">
              {/* Scroll Left Button */}
              <button
                onClick={() => scrollDates('left')}
                className="p-2 radius bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Scrollable Date Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Date Buttons */}
                {uniqueDates.map((date, index) => {
                  const [year, month, day] = date.split('-');
                  const shortYear = year.slice(-2);
                  const isSelected = selectedDate === date;
                  const isLatest = index === 0;
                  
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 radius text-sm font-medium transition-all duration-300 flex-shrink-0 flex items-center gap-2 ${
                        isSelected
                          ? ''
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      style={isSelected ? {
                        backgroundColor: colors.neon.red,
                        color: 'white',
                        boxShadow: `0 2px 10px ${colors.neon.red}66`
                      } : {}}
                    >
                      {isLatest && <Sparkles size={14} className="flex-shrink-0" />}
                      <span className="font-bold">{day}</span>
                      <span className="mx-1 opacity-60">{getShortMonthName(month)}</span>
                      <span className="opacity-40">{shortYear}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scroll Right Button */}
              <button
                onClick={() => scrollDates('right')}
                className="p-2 radius bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-4 text-white/60 text-sm"
              >
                <Calendar size={14} className="inline mr-2" />
                Показаны фото за {formatDateForDisplay(selectedDate)}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && !useFallback && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
            <span className="ml-3 text-white/60">Загружаем фотографии...</span>
          </div>
        )}

        {/* Error State with Retry */}
        {useFallback && (
          <div className="mb-6 p-4 radius backdrop-blur-md" style={{ backgroundColor: colors.glass.white }}>
            <div className="flex items-center justify-between">
              <p className="text-white/70">Используются локальные фотографии</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 radius text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={16} />
                Повторить
              </button>
            </div>
          </div>
        )}

        {/* Gallery Grid - Mobile‑first 2‑col grid; сохраняем 3:4 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
              className="relative group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className="relative overflow-hidden radius aspect-[3/4]">
                <img 
                  src={image.src} 
                  alt={image.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {image.date && (
                      <p className="text-white/90 text-sm font-medium">{formatDateForDisplay(image.date)}</p>
                    )}
                  </div>
                  
                  <div className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md"
                       style={{ backgroundColor: colors.glass.white }}>
                    <Maximize2 size={20} className="text-white" />
                  </div>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 radius opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                     style={{ 
                       boxShadow: `0 0 30px ${colors.neon.red}44, inset 0 0 30px ${colors.neon.red}22`
                     }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Trigger for Infinite Scrolling */}
        {!useFallback && hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage ? (
              <LoadingSpinner />
            ) : (
              <button
                onClick={() => fetchNextPage()}
                className="px-6 py-3 radius text-white backdrop-blur-md hover:bg-white/10 transition-colors"
                style={{ backgroundColor: colors.glass.white }}
              >
                Загрузить ещё
              </button>
            )}
          </div>
        )}

        {/* Instagram CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <a
            href="https://www.instagram.com/vnvnc_concerthall/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 radius border-2 border-white text-white font-display font-extrabold lowercase hover:bg-white hover:text-black transition-colors"
          >
            <Camera size={20} />
            <span>больше фото в insta</span>
          </a>
        </motion.div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={photoIndex}
        slides={filteredImages.map(img => {
          const path = (img as any).path as string | undefined
          const downloadUrl = path ? `${API_BASE_URL}/api/yandex-disk/download?path=${encodeURIComponent(path)}` : undefined
          return {
            src: (img as any).fullSrc || img.src,
            downloadUrl
          } as any
        })}
        plugins={[Download]}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' },
          slide: { cursor: 'grab' },
        }}
      />
    </div>
  )
}

export default GalleryPage