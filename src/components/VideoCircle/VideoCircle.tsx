import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VideoCircleProgress from './VideoCircleProgress'
import VideoCircleButton from './VideoCircleButton'
import { colors } from '../../utils/colors'
import useYandexVideos from '../../hooks/useYandexVideos'

interface VideoCircleProps {
  className?: string
  backgroundVideoRef?: React.RefObject<HTMLVideoElement | null>
}

const VideoCircle = ({ className = '', backgroundVideoRef }: VideoCircleProps) => {
  const { currentVideo, nextVideo, isLoading: videosLoading, fetchRandomVideo } = useYandexVideos()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [showMuteButton, setShowMuteButton] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle randomizer click with amazing animation
  const handleRandomize = async () => {
    setIsRandomizing(true)
    setIsLoading(true)
    setProgress(0)
    
    // Preserve current mute state
    const currentMuteState = isMuted
    
    // Add some delay for animation effect
    setTimeout(async () => {
      await fetchRandomVideo()
      
      setTimeout(() => {
        setIsLoading(false)
        setIsRandomizing(false)
        // Auto-play the new video with preserved mute state
        if (videoRef.current) {
          videoRef.current.muted = currentMuteState
          videoRef.current.play()
          setIsPlaying(true)
        }
      }, 300)
    }, 500)
  }

  // Handle click on video circle - Telegram style
  const handleCircleClick = () => {
    if (!isEnlarged) {
      // Enlarge and unmute
      setIsEnlarged(true)
      setIsMuted(false)
      setShowMuteButton(true) // Show mute button immediately
      if (videoRef.current) {
        videoRef.current.muted = false
        if (!isPlaying) {
          videoRef.current.play()
          setIsPlaying(true)
        }
      }
      // Auto-hide mute button after 3.5 seconds
      const timeout = setTimeout(() => {
        setShowMuteButton(false)
      }, 3500)
      setHideTimeout(timeout)
    } else {
      // If enlarged, clicking outside mute button makes it smaller
      setIsEnlarged(false)
      setShowMuteButton(false)
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }

  // Handle mouse enter on video circle
  const handleMouseEnter = () => {
    if (isEnlarged) {
      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
      setShowMuteButton(true)
      
      // Set new timeout to hide after 3.5 seconds
      const timeout = setTimeout(() => {
        setShowMuteButton(false)
      }, 3500)
      setHideTimeout(timeout)
    }
  }

  // Handle mouse leave
  const handleMouseLeave = () => {
    // Hide immediately on mouse leave
    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }
    setShowMuteButton(false)
  }

  // Handle mute toggle
  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
    
    // Keep button visible after click for a bit
    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }
    const timeout = setTimeout(() => {
      setShowMuteButton(false)
    }, 3000)
    setHideTimeout(timeout)
  }

  // Update progress and sync with background video
  useEffect(() => {
    const video = videoRef.current
    const bgVideo = backgroundVideoRef?.current
    if (!video) return

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100
      setProgress(progress)
    }

    const handleEnded = () => {
      // Don't stop, just restart (loop)
      if (video) {
        video.currentTime = 0
        video.play()
      }
    }

    // Sync with background video
    const syncVideos = () => {
      if (bgVideo && video && bgVideo.currentTime && Math.abs(video.currentTime - bgVideo.currentTime) > 0.5) {
        video.currentTime = bgVideo.currentTime
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('ended', handleEnded)
    
    // Always sync with background video
    if (bgVideo) {
      video.addEventListener('loadedmetadata', syncVideos)
      // Sync periodically to maintain sync
      const syncInterval = setInterval(syncVideos, 500)
      
      return () => {
        video.removeEventListener('timeupdate', updateProgress)
        video.removeEventListener('ended', handleEnded)
        video.removeEventListener('loadedmetadata', syncVideos)
        clearInterval(syncInterval)
      }
    }

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('ended', handleEnded)
    }
  }, [currentVideo, backgroundVideoRef])

  // Auto-play on video change and sync background
  useEffect(() => {
    if (videoRef.current && currentVideo) {
      // Update background video source to match circle video
      if (backgroundVideoRef?.current) {
        backgroundVideoRef.current.src = currentVideo.url
        backgroundVideoRef.current.load()
        backgroundVideoRef.current.play()
      }
      
      // Preserve the current mute state instead of always muting
      videoRef.current.muted = isMuted
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Autoplay failed:', err))
    }
  }, [currentVideo, isMuted, backgroundVideoRef])

  // Log when next video is preloaded
  useEffect(() => {
    if (nextVideo) {
      console.log('Next video preloaded and ready:', nextVideo.title)
    }
  }, [nextVideo])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }, [hideTimeout])

  // Show loading state while videos are being fetched
  if (videosLoading || !currentVideo) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative mx-auto w-[176px] h-[176px] md:w-[220px] md:h-[220px]">
          <div className="absolute inset-0 rounded-full p-[3px]" style={{ background: '#ff0040' }}>
            <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Video Circle Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: isEnlarged ? 1.5 : 1,
        }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="relative mx-auto"
        style={{
          marginTop: isEnlarged ? '100px' : '0',
          marginBottom: isEnlarged ? '80px' : '0',
          transition: 'margin 0.3s ease'
        }}
      >
        {/* Amazing randomization effect */}
        <AnimatePresence>
          {isRandomizing && (
            <motion.div
              initial={{ scale: 1, opacity: 0 }}
              animate={{ 
                scale: [1, 1.5, 2],
                opacity: [0.5, 0.3, 0],
                rotate: [0, 180, 360]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${colors.neon.red}60 0%, transparent 70%)`,
                filter: 'blur(20px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Glow effect when playing */}
        <AnimatePresence>
          {isPlaying && !isEnlarged && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.neon.red}30 0%, transparent 70%)`,
                filter: 'blur(30px)',
                transform: 'scale(1.3)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Main Circle */}
        <motion.div 
          className="relative w-[176px] h-[176px] md:w-[220px] md:h-[220px] cursor-pointer mx-auto"
          onClick={handleCircleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          animate={isRandomizing ? {
            rotate: [0, -10, 10, -10, 10, 0],
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Border using CSS border instead of padding to avoid artifacts */}
          <div className="absolute inset-0 rounded-full border-[3px] border-[#ff0040] overflow-hidden">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={currentVideo.url}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                autoPlay
              />

              {/* Center Mute/Unmute Button when enlarged and hovering */}
              <AnimatePresence>
                {isEnlarged && showMuteButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleMuteToggle}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/5 flex items-center justify-center border border-white/5 hover:bg-black/10 hover:border-white/10 transition-all"
                  >
                    {isMuted ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.6">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                        <line x1="23" y1="9" x2="17" y2="15"/>
                        <line x1="17" y1="9" x2="23" y2="15"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.6">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Play overlay when not playing */}
              <AnimatePresence>
                {!isPlaying && !isEnlarged && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

          {/* Progress Ring */}
          <VideoCircleProgress
            progress={progress}
            duration={currentVideo.duration || videoRef.current?.duration || 30}
            currentTime={videoRef.current?.currentTime || 0}
            isPlaying={isPlaying}
          />

          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Randomizer Button */}
      <motion.div
        animate={{ 
          y: isEnlarged ? 30 : 0 
        }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        <VideoCircleButton
          onClick={handleRandomize}
          isLoading={isLoading}
          isRandomizing={isRandomizing}
          className="mt-6"
        />
      </motion.div>

      {/* Hint text with arrow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: isEnlarged ? 30 : 0 
        }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/40 text-xs mt-3 flex items-center justify-center gap-1"
      >
        <span>↑</span>
        <span>Моменты из архива VNVNC</span>
        <span>↑</span>
      </motion.div>
    </div>
  )
}

export default VideoCircle