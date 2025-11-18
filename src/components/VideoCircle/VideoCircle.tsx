import { useState, useRef, useEffect, useCallback } from 'react'
import type { MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VideoCircleProgress from './VideoCircleProgress'
import VideoCircleButton from './VideoCircleButton'
import { colors } from '../../utils/colors'
import useYandexVideos from '../../hooks/useYandexVideos'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'

type VideoAsset = {
  id: string
  url: string
  title: string
  duration?: number
  name?: string
  path?: string
}

const FALLBACK_VIDEO: VideoAsset = {
  id: 'fallback-hero-video',
  url: '/herovideo-optimized.mp4',
  title: 'VNVNC Atmosphere',
  duration: 10,
  name: 'herovideo-optimized.mp4',
  path: '/herovideo-optimized.mp4',
}

interface VideoCircleProps {
  className?: string
  backgroundVideoRef?: React.RefObject<HTMLVideoElement | null>
  onExpandChange?: (isExpanded: boolean) => void
}

const VideoCircle = ({ className = '', backgroundVideoRef, onExpandChange }: VideoCircleProps) => {
  const { currentVideo: initialVideo, isLoading: videosLoading, videos, loadVideos } = useYandexVideos({ autoLoad: false, initialDelayMs: 1200 })
  const [currentVideo, setCurrentVideo] = useState<VideoAsset>(initialVideo ?? FALLBACK_VIDEO)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [showMuteButton, setShowMuteButton] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isTransitioningRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasShuffled, setHasShuffled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  
  // Refs to access latest state in timeouts/callbacks
  const videosRef = useRef(videos)
  const currentVideoRef = useRef(currentVideo)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Update refs
  useEffect(() => { videosRef.current = videos }, [videos])
  useEffect(() => { currentVideoRef.current = currentVideo }, [currentVideo])

  const containerRef = useRef<HTMLDivElement>(null)
  const hasRequestedVideosRef = useRef(false)
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden,
  )
  const shouldPlay = isPageVisible
  const shouldAnimate = shouldPlay && !prefersReducedMotion
  
  // Check if mounted and if mobile on mount and resize
  useEffect(() => {
    setIsMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(typeof document === 'undefined' ? true : !document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])
  
  // Sync with initial video from hook (for initial load)
  useEffect(() => {
    if (initialVideo && initialVideo.id !== currentVideo.id) {
      setCurrentVideo(initialVideo)
      if (backgroundVideoRef?.current) {
        backgroundVideoRef.current.src = initialVideo.url
        backgroundVideoRef.current.load()
        backgroundVideoRef.current.play().catch(() => {})
      }
    }
  }, [initialVideo, currentVideo.id, backgroundVideoRef])

  useEffect(() => {
    if (!initialVideo && backgroundVideoRef?.current && shouldPlay) {
      backgroundVideoRef.current.src = currentVideo.url
      backgroundVideoRef.current.load()
      backgroundVideoRef.current.play().catch(() => {})
    }
  }, [initialVideo, currentVideo.url, backgroundVideoRef, shouldPlay])

  useEffect(() => {
    if (!hasRequestedVideosRef.current) {
      hasRequestedVideosRef.current = true
      void loadVideos()
    }
  }, [loadVideos])

  // Handle randomizer click with smooth transition
  const handleRandomize = useCallback(async () => {
    if (!shouldPlay) {
      return
    }

    // Ensure videos are requested
    if (!hasRequestedVideosRef.current) {
      hasRequestedVideosRef.current = true
      void loadVideos()
    }

    // Helper to get random video
    const getRandomVideo = (videoList: VideoAsset[], excludeId: string) => {
       // First try to filter out the current video
       const available = videoList.filter(v => v.id !== excludeId)
       if (available.length === 0) {
         // If no other videos (only 1 total), just return it
         return videoList.length > 0 ? videoList[0] : null
       }
       return available[Math.floor(Math.random() * available.length)]
    }

    // If videos list is empty, wait a bit and retry
    if (videos.length === 0) {
        setIsRandomizing(true)
        setIsTransitioning(true)
        isTransitioningRef.current = true
        
        setTimeout(() => {
             const retryVideo = getRandomVideo(videosRef.current, currentVideoRef.current.id)
             if (retryVideo && retryVideo.id !== currentVideoRef.current.id) {
                 setCurrentVideo(retryVideo)
             } else {
                 setIsTransitioning(false)
                 isTransitioningRef.current = false
                 setIsRandomizing(false)
             }
        }, 1000)
        return
    }

    setIsRandomizing(true)
    setIsTransitioning(true)
    isTransitioningRef.current = true

    let newVideoData: VideoAsset | null = null

    if (!hasShuffled) {
      setHasShuffled(true)
      newVideoData = getRandomVideo(videos, currentVideo.id)
    } else {
      newVideoData = getRandomVideo(videos, currentVideo.id)
    }
    
    // Safety check - try to get different video if possible
    if (newVideoData && newVideoData.id === currentVideo.id && videos.length > 1) {
        const retry = getRandomVideo(videos, currentVideo.id)
        if (retry) newVideoData = retry
    }
    
    if (newVideoData) {
      // Just update the state, let useEffect handle the loading/switching
      setCurrentVideo(newVideoData)
    } else {
      setIsTransitioning(false)
      isTransitioningRef.current = false
      setIsRandomizing(false)
    }

  }, [shouldPlay, hasShuffled, videos, currentVideo.id, loadVideos])

  // Handle click on video circle - Telegram style
  const handleCircleClick = () => {
    if (!shouldPlay) {
      return
    }
    if (!isEnlarged) {
      // Enlarge and unmute
      setIsEnlarged(true)
      onExpandChange?.(true) // Notify parent
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
      onExpandChange?.(false) // Notify parent
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
  const handleMuteToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!shouldPlay) {
      return
    }
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

    if (!shouldPlay) {
      video.pause()
      if (bgVideo) {
        bgVideo.pause()
      }
      setIsPlaying(false)
      return
    }

    if (!shouldAnimate) {
      return
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

    // Optimized progress update
    let lastUpdate = 0
    const updateProgress = () => {
      const now = Date.now()
      if (now - lastUpdate < 100) return // Limit to ~10fps
      
      lastUpdate = now
      const progress = (video.currentTime / video.duration) * 100
      setProgress(progress)
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
  }, [currentVideo, backgroundVideoRef, shouldPlay, shouldAnimate])

  // Auto-play on video change and always sync background (including first selection)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentVideo) {
      return
    }

    if (!shouldPlay) {
      video.pause()
      setIsPlaying(false)
      return
    }

    // Only update if src is different (checking absolute URLs to be safe)
    const currentUrl = currentVideo.url
    const videoSrc = video.src
    
    // Check if we need to update source (simple check first)
    const needsUpdate = videoSrc !== currentUrl && !videoSrc.endsWith(currentUrl)

    if (needsUpdate && backgroundVideoRef?.current) {
      // Pause first
      video.pause()
      backgroundVideoRef.current.pause()
      
      video.src = currentUrl
      backgroundVideoRef.current.src = currentUrl
      
      video.load()
      backgroundVideoRef.current.load()
    }

    video.muted = isMuted
    
    // Play logic
    const playVideo = () => {
        const playPromise = video.play()
        if (playPromise !== undefined) {
            playPromise
            .then(() => {
                setIsPlaying(true)
                // Successful play means transition is done
                if (isTransitioningRef.current) {
                    // Small delay to ensure overlay fades out smoothly after video starts
                    setTimeout(() => {
                        setIsTransitioning(false)
                        setIsRandomizing(false)
                        isTransitioningRef.current = false
                        setProgress(0)
                    }, 100) 
                }
            })
            .catch((err) => {
                // Ignore AbortError
                if (err.name !== 'AbortError') {
                    setIsPlaying(false)
                    console.error("Play failed:", err)
                }
                // If not aborted (real error), we should probably stop transitioning
                if (err.name !== 'AbortError' && isTransitioningRef.current) {
                     setIsTransitioning(false)
                     setIsRandomizing(false)
                     isTransitioningRef.current = false
                }
            })
        }
    }

    if (video.readyState >= 3) {
        playVideo()
    } else {
        // Use canplay which fires when enough data is available
        const onCanPlay = () => {
           video.removeEventListener('canplay', onCanPlay)
           playVideo()
        }
        video.addEventListener('canplay', onCanPlay, { once: true })
    }
    
    return () => {
        // Cleanup listeners on effect re-run
    }
  }, [currentVideo, isMuted, backgroundVideoRef, shouldPlay])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }, [hideTimeout])

  useEffect(() => {
    if (!shouldPlay) {
      setIsTransitioning(false)
      setIsRandomizing(false)
      isTransitioningRef.current = false
    }
  }, [shouldPlay])

  useEffect(() => {
    isTransitioningRef.current = isTransitioning
  }, [isTransitioning])

  // Don't render until mounted to avoid SSR/hydration issues with framer-motion
  if (!isMounted) {
    return null
  }

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
          scale: isEnlarged ? (isMobile ? 1.15 : 1.5) : 1,
        }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="relative mx-auto"
        style={{
          // On mobile, move down when expanded; on desktop, center vertically
          marginTop: isEnlarged ? (isMobile ? '30px' : '100px') : '0',
          marginBottom: isEnlarged ? (isMobile ? '20px' : '80px') : '0',
          transition: 'margin 0.3s ease',
          // No transform needed
          transform: undefined
        }}
      >
        {/* Portal activation ripples - multiple expanding circles */}
        <AnimatePresence>
          {isRandomizing && shouldAnimate && (
            <>
              {/* First ripple - starts immediately */}
              <motion.div
                initial={{ 
                  width: isMobile ? 176 : 220, 
                  height: isMobile ? 176 : 220, 
                  opacity: 0 
                }}
                animate={{ 
                  width: isMobile ? [176, 600] : [220, 800],
                  height: isMobile ? [176, 600] : [220, 800],
                  opacity: [0, 0.8, 0.6, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  border: `2px solid ${colors.neon.red}`,
                  boxShadow: `0 0 40px ${colors.neon.red}80`
                }}
              />
              
              {/* Second ripple - starts after 0.3s */}
              <motion.div
                initial={{ 
                  width: isMobile ? 176 : 220, 
                  height: isMobile ? 176 : 220, 
                  opacity: 0 
                }}
                animate={{ 
                  width: isMobile ? [176, 800] : [220, 1200],
                  height: isMobile ? [176, 800] : [220, 1200],
                  opacity: [0, 0.7, 0.4, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  border: `1px solid ${colors.neon.red}`,
                  boxShadow: `0 0 60px ${colors.neon.red}60`
                }}
              />
              
              {/* Third ripple - starts after 0.6s */}
              <motion.div
                initial={{ 
                  width: isMobile ? 176 : 220, 
                  height: isMobile ? 176 : 220, 
                  opacity: 0 
                }}
                animate={{ 
                  width: isMobile ? [176, 1000] : [220, 1600],
                  height: isMobile ? [176, 1000] : [220, 1600],
                  opacity: [0, 0.6, 0.3, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: 'easeOut', delay: 0.6 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  border: `1px solid ${colors.neon.red}`,
                  boxShadow: `0 0 80px ${colors.neon.red}40`
                }}
              />
              
              {/* Fourth ripple - starts after 0.9s - goes really big */}
              <motion.div
                initial={{ 
                  width: isMobile ? 176 : 220, 
                  height: isMobile ? 176 : 220, 
                  opacity: 0 
                }}
                animate={{ 
                  width: isMobile ? [176, 1400] : [220, 2000],
                  height: isMobile ? [176, 1400] : [220, 2000],
                  opacity: [0, 0.5, 0.2, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3.5, ease: 'easeOut', delay: 0.9 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  border: `1px solid ${colors.neon.red}`,
                  boxShadow: `0 0 100px ${colors.neon.red}30`
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Subtle glow when playing */}
        <AnimatePresence>
          {isPlaying && !isEnlarged && shouldAnimate && (
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
          animate={isRandomizing && shouldAnimate ? {
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
                preload="metadata"
                autoPlay
                crossOrigin="anonymous"
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
          {shouldAnimate && (
            <VideoCircleProgress
              progress={progress}
              duration={currentVideo.duration || videoRef.current?.duration || 30}
              currentTime={videoRef.current?.currentTime || 0}
              isPlaying={isPlaying}
            />
          )}

        </motion.div>
      </motion.div>

      {/* Randomizer Button */}
      <motion.div
        animate={{ 
          y: isEnlarged ? (isMobile ? 20 : 30) : 0 
        }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        <VideoCircleButton
          onClick={() => void handleRandomize()}
          isLoading={isTransitioning}
          isRandomizing={isRandomizing}
          className="mt-6"
        />
      </motion.div>

      {/* Refined hint text - hide on mobile when expanded */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: (isEnlarged && isMobile) ? 0 : (isMobile ? 0.7 : 0.5), 
          y: isEnlarged ? (isMobile ? 15 : 30) : 0 
        }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-center text-white/40 sm:text-white/30 text-xs mt-4 tracking-widest uppercase"
        style={{
          display: (isEnlarged && isMobile) ? 'none' : 'block'
        }}
      >
        <div className="flex items-center justify-center gap-4">
          <span className="block w-8 h-px bg-white/20" />
          <span className="text-white/80">Моменты из архива VNVNC</span>
          <span className="block w-8 h-px bg-white/20" />
        </div>
      </motion.div>
    </div>
  )
}

export default VideoCircle
