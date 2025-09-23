import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react'
// Colors removed - not needed anymore

interface VideoFullscreenViewerProps {
  videos: Array<{
    id: string
    url: string
    title: string
  }>
  initialIndex: number
  onClose: () => void
}

const VideoFullscreenViewer = ({ videos, initialIndex, onClose }: VideoFullscreenViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentVideo = videos[currentIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') navigatePrev()
      if (e.key === 'ArrowRight') navigateNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [currentIndex])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false))
    }
  }, [currentIndex])

  const navigateNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const navigatePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x < -threshold) {
      navigateNext()
    } else if (info.offset.x > threshold) {
      navigatePrev()
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close Button - More visible */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-6 right-6 z-[10000] p-3 rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-600 transition-all hover:scale-110"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Video Container - Fullscreen */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full z-[9999]"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={currentVideo.url}
              className="w-full h-full object-contain"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onClick={togglePlay}
            />

            {/* Play/Pause Overlay - Only when paused */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div
                    className="p-4 rounded-full bg-black/50 backdrop-blur-sm pointer-events-auto"
                    onClick={togglePlay}
                  >
                    <Play size={32} className="text-white" fill="white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Arrows - More visible */}
            {currentIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigatePrev()
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-110"
              >
                <ChevronLeft size={32} className="text-white" />
              </button>
            )}

            {currentIndex < videos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateNext()
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-110"
              >
                <ChevronRight size={32} className="text-white" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Controls - More visible */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleMute()
          }}
          className="absolute bottom-6 right-6 z-[10000] p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-110"
        >
          {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
        </button>

        {/* Dots indicator - More visible */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex gap-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VideoFullscreenViewer