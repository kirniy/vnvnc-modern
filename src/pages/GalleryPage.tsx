import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, Maximize2, RefreshCw, Calendar, ChevronLeft, ChevronRight, FileDown, Download as DownloadIcon } from 'lucide-react'
// no default Download plugin; render our custom buttons outside Lightbox
import { useSearchParams } from 'react-router-dom'
import Lightbox from 'yet-another-react-lightbox'
// no default download plugin; we render two custom buttons in toolbar
import 'yet-another-react-lightbox/styles.css'
import { colors } from '../utils/colors'
import { useInfiniteYandexPhotos, useYandexDates } from '../hooks/useYandexPhotos'
import LoadingSpinner from '../components/LoadingSpinner'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import BackButton from '../components/BackButton'
import { PageBackground } from '../components/PageBackground'
import { LiquidButton } from '../components/ui/liquid-glass-button'
import VideoGalleryGrid from '../components/VideoGalleryGrid'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const [showVideos, setShowVideos] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Stable randomization keys per image to keep order consistent across renders
  const shuffleKeyByImageRef = useRef<Map<string, number>>(new Map())
  const getImageStableKey = (img: any): string =>
    (img?.id as string) || (img?.path as string) || (img?.src as string) || (img?.name as string)
  const getShuffleKey = (img: any): number => {
    const k = getImageStableKey(img)
    if (!shuffleKeyByImageRef.current.has(k)) {
      shuffleKeyByImageRef.current.set(k, Math.random())
    }
    return shuffleKeyByImageRef.current.get(k) as number
  }

  // Snapshot of images used for currently opened lightbox to prevent index drift
  const [lightboxImages, setLightboxImages] = useState<any[]>([])

  // Fetch all available dates from Yandex Disk
  const { data: allDates = [] } = useYandexDates()

  // Initialize date from URL parameter on mount
  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam && allDates.includes(dateParam)) {
      setSelectedDate(dateParam)
    } else if (!useFallback && allDates.length > 0 && selectedDate === null && !dateParam) {
      // Auto-select latest date only if no date param provided
      setSelectedDate(allDates[0])
    }
  }, [allDates, useFallback]) // Removed searchParams and selectedDate dependencies to prevent loops

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

    // Group photos by date
    const photosByDate = new Map<string, any[]>();

    images.forEach(img => {
      const date = img.date || 'unknown';
      if (!photosByDate.has(date)) {
        photosByDate.set(date, []);
      }
      photosByDate.get(date)!.push(img);
    });

    // Sort dates (newest first)
    const sortedDates = Array.from(photosByDate.keys()).sort((a, b) => {
      if (a === 'unknown') return 1;
      if (b === 'unknown') return -1;
      return b.localeCompare(a);
    });

    // Stable-random order within each date and flatten
    const result: any[] = [];
    sortedDates.forEach(date => {
      const photosForDate = photosByDate.get(date)!;
      const shuffledPhotos = photosForDate
        .map(img => ({ img, key: getShuffleKey(img) }))
        .sort((a, b) => a.key - b.key)
        .map(({ img }) => img);
      result.push(...shuffledPhotos);
    });

    return result;
  }, [allPhotos, selectedDate]);

  const openLightbox = (index: number) => {
    setPhotoIndex(index)
    // Freeze the current list to avoid index mismatch if the list changes while lightbox is open
    setLightboxImages(filteredImages)
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

  // API base для full-res загрузки
  const API_BASE_URL = import.meta.env.PROD
    ? 'https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net'
    : 'http://localhost:8787'

  // Программная загрузка, чтобы избежать 0-byte при кросс-домене
  const downloadViaFetch = async (url: string, filename: string) => {
    try {
      const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objUrl)
    } catch (e) {
      console.error('download failed', e)
      // запасной вариант — открыть ссылку в новом окне
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="min-h-screen pt-20 relative">
      <PageBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <BackButton to="/" text="на главную" />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="text-neon-red" size={32} style={{ color: colors.neon.red }} />
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold lowercase text-stretch-heading break-words">
              галерея <span style={{ color: colors.neon.red }}>vnvnc</span>
            </h1>
            <Sparkles className="text-neon-red" size={32} style={{ color: colors.neon.red }} />
          </div>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto text-stretch-body">
            Погрузитесь в атмосферу самых запоминающихся вечеров
          </p>

          {/* Toggle Selector for Photo/Video */}
          <div className="flex justify-center mt-6 gap-3">
            <LiquidButton
              onClick={() => setShowVideos(false)}
              className={`${!showVideos ? 'opacity-100 scale-105' : 'opacity-60'}`}
              size="xl"
            >
              ФОТО
            </LiquidButton>
            <LiquidButton
              onClick={() => setShowVideos(true)}
              className={`${showVideos ? 'opacity-100 scale-105' : 'opacity-60'}`}
              size="xl"
            >
              ВИДЕО
            </LiquidButton>
          </div>
        </motion.div>

        {/* Content Based on Mode */}
        <AnimatePresence mode="wait">
          {showVideos ? (
            // Video Gallery Mode
            <motion.div
              key="video-gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VideoGalleryGrid />
            </motion.div>
          ) : (
            // Photo Gallery Mode
            <motion.div
              key="photo-gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide flex-1 whitespace-nowrap snap-x snap-mandatory py-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain' as any }}
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
                      onClick={() => {
                        setSelectedDate(date)
                        // Update URL without triggering re-renders
                        const newParams = new URLSearchParams(searchParams)
                        newParams.set('date', date)
                        setSearchParams(newParams, { replace: true })
                      }}
                      className={`inline-flex items-center gap-2 h-10 leading-none px-4 radius text-sm font-medium transition-colors duration-200 flex-shrink-0 snap-start ${
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
          <div className="fixed inset-0 z-[95] flex items-center justify-center">
            <LoadingSpinner />
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
              key={getImageStableKey(image)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.2) }}  // Reduced delays
              className="relative group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className="relative overflow-hidden radius aspect-[3/4]">
                <img 
                  src={image.src}
                  srcSet={[
                    image.thumbnailSrc ? `${image.thumbnailSrc} 300w` : '',
                    `${image.src} 800w`,
                    (image as any).fullSrc ? `${(image as any).fullSrc} 1280w` : ''
                  ].filter(Boolean).join(', ')}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  alt={image.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
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
            href="https://www.instagram.com/vnvnc_spb"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 radius border-2 border-white text-white font-display font-extrabold lowercase hover:bg-white hover:text-black transition-colors"
          >
            <Camera size={20} />
            <span>больше фото в insta</span>
          </a>
        </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={photoIndex}
        slides={(lightboxImages.length > 0 ? lightboxImages : filteredImages).map(img => {
          const name = ((img as any).name || (img as any).filename || 'vnvnc-photo.jpg') as string
          const bestSrc = (img as any).fullSrc || img.src
          const path = (img as any).path as string | undefined
          // Источник для fullres: либо наш download по path, либо оригинальный URL
          const originalUrl = (img as any).originalUrl || bestSrc
          const fullresSource = path
            ? `${API_BASE_URL}/api/yandex-disk/download?path=${encodeURIComponent(path)}`
            : originalUrl
          // Проксируем fullres через наш proxy для гарантии CORS и корректного бинарного тела
          const fullresProxied = `${API_BASE_URL}/api/yandex-disk/proxy?url=${encodeURIComponent(fullresSource)}`
          return {
            src: bestSrc,
            downloadUrl: bestSrc,
            download: name,
            _fullres: fullresSource,
            _fullresProxied: fullresProxied,
            _filename: name
          } as any
        })}
        // заменим стандартную кнопку закрытия на группу (compressed + fullres + close)
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' },
          slide: { cursor: 'grab' },
        }}
        render={{
          buttonClose: () => {
            const list = (lightboxImages.length > 0 ? lightboxImages : filteredImages) as any[]
            const slide = list[photoIndex] as any
            const compressedUrl = (slide?.fullSrc || slide?.src) as string
            const filename = (slide?.name || slide?.filename || 'vnvnc-photo.jpg') as string
            const pathForOriginal = (slide?.path) as string | undefined
            const fullresUrl = pathForOriginal
              ? `${API_BASE_URL}/api/yandex-disk/download?path=${encodeURIComponent(pathForOriginal)}`
              : ((slide?.originalUrl || slide?.fullSrc || slide?.src) as string)
            return (
              <div className="flex items-center gap-2 mr-2">
                <button
                  onClick={() => downloadViaFetch(compressedUrl, filename)}
                  className="p-3 radius bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label="download compressed"
                >
                  <DownloadIcon size={22} />
                </button>
                <button
                  onClick={() => downloadViaFetch(fullresUrl, filename)}
                  className="p-3 radius bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label="download fullres"
                >
                  <FileDown size={22} />
                </button>
                <button onClick={() => setLightboxOpen(false)} aria-label="close" className="yarl__button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
            )
          }
        }}
      />
    </div>
  )
}

export default GalleryPage