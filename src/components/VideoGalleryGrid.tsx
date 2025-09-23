import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import MiniVideoCircle from './MiniVideoCircle'
import useYandexVideos from '../hooks/useYandexVideos'
import LoadingSpinner from './LoadingSpinner'
// Colors not needed - removed glow effect

const VideoGalleryGrid = () => {
  const { videos, isLoading, error } = useYandexVideos()
  // No expanded state needed - videos go directly to fullscreen
  const [globalMutedId, setGlobalMutedId] = useState<string | null>(null)
  const [displayVideos, setDisplayVideos] = useState<typeof videos>([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [shownVideoIds, setShownVideoIds] = useState<Set<string>>(new Set())
  const [remainingVideos, setRemainingVideos] = useState<typeof videos>([])

  // Initialize display videos when videos are loaded
  useEffect(() => {
    if (videos.length > 0 && displayVideos.length === 0) {
      // Shuffle all videos initially
      const shuffled = [...videos].sort(() => Math.random() - 0.5)
      const initialBatch = shuffled.slice(0, 16)

      setDisplayVideos(initialBatch)
      setRemainingVideos(shuffled.slice(16))
      setShownVideoIds(new Set(initialBatch.map(v => v.id)))
    }
  }, [videos, displayVideos.length])

  // Expand/collapse handled by fullscreen viewer in MiniVideoCircle

  const handleMuteChange = (id: string | null) => {
    setGlobalMutedId(id)
  }

  const shuffleVideos = () => {
    setIsShuffling(true)
    setTimeout(() => {
      let newBatch = []
      let availableVideos = [...remainingVideos]

      // If we've shown all videos or have less than 16 remaining, reset the pool
      if (remainingVideos.length < 16) {
        // Get all videos that weren't just shown
        const currentlyShownIds = new Set(displayVideos.map(v => v.id))
        availableVideos = videos
          .filter(v => !currentlyShownIds.has(v.id))
          .sort(() => Math.random() - 0.5)

        // If still not enough (less than 32 total videos), allow some repeats after shuffling
        if (availableVideos.length < 16) {
          const additionalNeeded = 16 - availableVideos.length
          const reusable = videos
            .filter(v => !availableVideos.some(av => av.id === v.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, additionalNeeded)
          availableVideos = [...availableVideos, ...reusable]
        }
      }

      // Take the next 16 videos
      newBatch = availableVideos.slice(0, 16)
      const newRemaining = availableVideos.slice(16)

      // Update state
      setDisplayVideos(newBatch)
      setRemainingVideos(newRemaining)

      // Update shown IDs (keep memory of all shown videos)
      const newShownIds = new Set(shownVideoIds)
      newBatch.forEach(v => newShownIds.add(v.id))

      // Reset if we've cycled through all videos
      if (newShownIds.size >= videos.length && videos.length > 16) {
        setShownVideoIds(new Set(newBatch.map(v => v.id)))
      } else {
        setShownVideoIds(newShownIds)
      }

      setIsShuffling(false)
    }, 300)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60 mb-4">Не удалось загрузить видео</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 radius bg-white/10 hover:bg-white/20 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Shuffle Button and Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-4 mb-8"
      >
        <button
          onClick={shuffleVideos}
          disabled={isShuffling}
          className="flex items-center gap-2 px-6 py-3 radius border-2 border-white/20 bg-black/30 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw
            size={20}
            className={`${isShuffling ? 'animate-spin' : ''}`}
          />
          <span className="font-medium">Перемешать</span>
        </button>

        {/* Progress indicator */}
        {videos.length > 0 && (
          <div className="text-white/60 text-sm">
            Показано: {Math.min(shownVideoIds.size, videos.length)} из {videos.length} видео
            {remainingVideos.length === 0 && shownVideoIds.size >= videos.length && videos.length > 16 && (
              <span className="text-white/40 ml-2">(начнём сначала)</span>
            )}
          </div>
        )}
      </motion.div>

      {/* Video Grid - Optimized for larger circles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 px-4 sm:px-0 justify-items-center">
        <AnimatePresence mode="popLayout">
          {displayVideos.map((video, index) => (
            <motion.div
              key={video.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.3,
                delay: isShuffling ? index * 0.03 : 0
              }}
              className="flex justify-center items-center"
            >
              <MiniVideoCircle
                video={video}
                isExpanded={false}
                onExpand={() => {}}
                onCollapse={() => {}}
                globalMutedId={globalMutedId}
                onMuteChange={handleMuteChange}
                allVideos={displayVideos}
                videoIndex={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Info Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 text-white/40 text-sm"
      >
        <p>Нажмите на кружок для увеличения и включения звука</p>
      </motion.div>

      {/* No glow effect needed - fullscreen viewer handles its own background */}
    </div>
  )
}

export default VideoGalleryGrid