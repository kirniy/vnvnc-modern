import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../utils/colors'
import VideoFullscreenViewer from './VideoFullscreenViewer'

interface MiniVideoCircleProps {
  video: {
    id: string
    url: string
    title: string
    duration?: number
  }
  isExpanded: boolean
  onExpand: (id: string) => void
  onCollapse: () => void
  globalMutedId: string | null
  onMuteChange: (id: string | null) => void
  allVideos?: Array<{ id: string; url: string; title: string }>
  videoIndex?: number
}

const MiniVideoCircle = ({
  video,
  isExpanded: _isExpanded,  // Unused but kept for compatibility
  onExpand: _onExpand,  // Unused but kept for compatibility
  onCollapse,
  globalMutedId,
  onMuteChange: _onMuteChange,  // Unused but kept for compatibility
  allVideos = [],
  videoIndex = 0
}: MiniVideoCircleProps) => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMuted = globalMutedId !== video.id

  // Auto-play when component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [])

  // Update mute state based on global muted video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  // Update progress
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100
      setProgress(progress)
    }

    const handleEnded = () => {
      video.currentTime = 0
      video.play()
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  const handleClick = () => {
    // Directly open fullscreen viewer on click
    setShowFullscreen(true)
  }

  // Mute handled in fullscreen viewer now

  // Increased size for better visibility
  const size = { width: 180, height: 180 }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        width: size.width,
        height: size.height
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5
      }}
      className="relative cursor-pointer z-10"
      onClick={handleClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      role="button"
      aria-label={video.title}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleClick()
        }
      }}
      // No special positioning needed since we're not expanding in place
    >
      {/* No background blur needed - fullscreen viewer handles its own background */}

      {/* Video Circle */}
      <div className="relative w-full h-full">
        {/* Border */}
        <div className="absolute inset-0 rounded-full border-2 overflow-hidden"
             style={{ borderColor: colors.neon.red }}>
          {/* Video */}
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover"
            muted={isMuted}
            loop
            playsInline
            autoPlay
          />

          {/* Hover Overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              >
                {/* No icons - just subtle overlay on hover */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={size.width / 2}
            cy={size.height / 2}
            r={(size.width / 2) - 2}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
          />
          <circle
            cx={size.width / 2}
            cy={size.height / 2}
            r={(size.width / 2) - 2}
            fill="none"
            stroke={colors.neon.red}
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * ((size.width / 2) - 2)}`}
            strokeDashoffset={`${2 * Math.PI * ((size.width / 2) - 2) * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-200"
          />
        </svg>

        {/* Play indicator when not playing */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Viewer - Rendered in Portal */}
      {showFullscreen && allVideos.length > 0 && createPortal(
        <VideoFullscreenViewer
          videos={allVideos}
          initialIndex={videoIndex}
          onClose={() => {
            setShowFullscreen(false)
            onCollapse()
          }}
        />,
        document.body
      )}
    </motion.div>
  )
}

export default MiniVideoCircle
