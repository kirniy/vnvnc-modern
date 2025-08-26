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
  const { currentVideo: initialVideo, nextVideo, isLoading: videosLoading, videos } = useYandexVideos()
  const [currentVideo, setCurrentVideo] = useState(initialVideo)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [showMuteButton, setShowMuteButton] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasShuffled, setHasShuffled] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Sync with initial video from hook (for initial load)
  useEffect(() => {
    if (initialVideo && !currentVideo) {
      setCurrentVideo(initialVideo)
    }
  }, [initialVideo, currentVideo])

  // Handle randomizer click with smooth transition
  const handleRandomize = async () => {
    setIsRandomizing(true)
    setIsTransitioning(true)
    
    // Preserve current mute state and keep current video playing
    const currentMuteState = isMuted
    
    // Get a random video WITHOUT changing currentVideo yet
    let newVideoData = null
    if (!hasShuffled) {
      setHasShuffled(true)
      // First shuffle - switch from background to Yandex
      if (videos.length > 0) {
        const availableVideos = videos.filter(v => v.id !== currentVideo?.id)
        if (availableVideos.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(availableVideos.length, 6))
          newVideoData = availableVideos[randomIndex]
        }
      }
    } else {
      // Subsequent shuffles
      const availableVideos = videos.filter(v => v.id !== currentVideo?.id)
      if (availableVideos.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableVideos.length)
        newVideoData = availableVideos[randomIndex]
      }
    }
    
    if (!newVideoData) {
      setIsTransitioning(false)
      setIsRandomizing(false)
      return
    }
    
    // Preload the new video WITHOUT updating currentVideo
    const newVideo = document.createElement('video')
    newVideo.src = newVideoData.url
    newVideo.muted = currentMuteState
    newVideo.playsInline = true
    newVideo.loop = true
    
    // Preload the new video
    newVideo.load()
    
    const handleCanPlay = () => {
      // NOW update both videos simultaneously
      if (videoRef.current && backgroundVideoRef?.current) {
        // Update both videos at exactly the same time
        videoRef.current.src = newVideoData.url
        videoRef.current.muted = currentMuteState
        videoRef.current.load()
        
        backgroundVideoRef.current.src = newVideoData.url
        backgroundVideoRef.current.load()
        backgroundVideoRef.current.play()
        
        videoRef.current.play().then(() => {
          setIsTransitioning(false)
          setIsRandomizing(false)
          setProgress(0)
          setIsPlaying(true)
          // NOW update the currentVideo state after both are playing
          setCurrentVideo(newVideoData)
        }).catch(() => {
          setIsTransitioning(false)
          setIsRandomizing(false)
        })
      }
    }
    
    newVideo.addEventListener('canplaythrough', handleCanPlay, { once: true })
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

  // Auto-play on video change - but DON'T update background during transitions
  useEffect(() => {
    if (videoRef.current && currentVideo && !isTransitioning && !isRandomizing) {
      // Don't update background if it's the initial hero video - they're meant to be different
      // Only sync background after the first portal click
      if (backgroundVideoRef?.current && hasShuffled) {
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
  }, [currentVideo, isMuted, backgroundVideoRef, isTransitioning, isRandomizing, hasShuffled])

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
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              background: `conic-gradient(from 0deg, transparent, ${colors.neon.red}40, transparent)`,
              filter: 'blur(8px)'
            }}
          />
          <div className="absolute inset-0 rounded-full border border-white/10 bg-black/90 backdrop-blur-md flex items-center justify-center">
            <div className="text-white/60 text-sm tracking-wider uppercase">
              Портал
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
          // On mobile, only push down with no top margin; on desktop, center vertically
          marginTop: isEnlarged ? (isMobile ? '0' : '100px') : '0',
          marginBottom: isEnlarged ? (isMobile ? '60px' : '80px') : '0',
          transition: 'margin 0.3s ease, transform 0.3s ease',
          // On mobile, use transform to push down the enlarged circle
          transform: isEnlarged && isMobile ? 'translateY(100px)' : undefined
        }}
      >
        {/* Portal activation pulse - perfect circle */}
        <AnimatePresence>
          {isRandomizing && (
            <motion.div
              initial={{ width: '100%', height: '100%', opacity: 0 }}
              animate={{ 
                width: ['100%', '180%'],
                height: ['100%', '180%'],
                opacity: [0.8, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                aspectRatio: '1 / 1',
                border: `2px solid ${colors.neon.red}`,
                boxShadow: `0 0 30px ${colors.neon.red}60`
              }}
            />
          )}
        </AnimatePresence>

        {/* Subtle glow when playing */}
        <AnimatePresence>
          {isPlaying && !isEnlarged && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.3, 0.5, 0.3]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${colors.neon.red}20 0%, transparent 60%)`,
                filter: 'blur(40px)',
                transform: 'scale(1.4)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Main Portal Circle */}
        <motion.div 
          className="relative w-[176px] h-[176px] md:w-[220px] md:h-[220px] cursor-pointer mx-auto"
          onClick={handleCircleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.02 }}
          animate={isRandomizing ? {
            scale: [1, 0.98, 1.02, 1],
          } : {}}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
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
              
              {/* Transition overlay - subtle with interesting animation */}
              <AnimatePresence>
                {isTransitioning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Portal vortex effect */}
                    <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{
                        background: `conic-gradient(from 0deg, transparent, ${colors.neon.red}20, transparent, ${colors.neon.red}20, transparent)`,
                        filter: 'blur(4px)'
                      }}
                    />
                    
                    {/* Central portal spinner */}
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-16 h-16 rounded-full border-2 border-white/20"
                        style={{ borderTopColor: colors.neon.red, borderRightColor: colors.neon.red }}
                      />
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 0.8, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-2 rounded-full border border-white/30"
                        style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

        </motion.div>
      </motion.div>

      {/* Randomizer Button */}
      <motion.div
        animate={{ 
          y: isEnlarged ? (isMobile ? 60 : 30) : 0 
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
          isLoading={isTransitioning}
          isRandomizing={isRandomizing}
          className="mt-6"
        />
      </motion.div>

      {/* Refined hint text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 0.5, 
          y: isEnlarged ? (isMobile ? 60 : 30) : 0 
        }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-center text-white/30 text-xs mt-4 tracking-widest uppercase"
      >
        <div className="flex items-center justify-center gap-4">
          <span className="block w-8 h-px bg-white/20" />
          <span>Моменты из архива VNVNC</span>
          <span className="block w-8 h-px bg-white/20" />
        </div>
      </motion.div>
    </div>
  )
}

export default VideoCircle