import { useState, useRef, useEffect, useCallback, memo } from 'react'
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

// Internal component for a single video player to keep things clean
const SinglePlayer = memo(({ 
  video, 
  isActive, 
  isMuted, 
  onCanPlay, 
  onTimeUpdate, 
  onEnded,
  videoRef
}: { 
  video: VideoAsset | null, 
  isActive: boolean, 
  isMuted: boolean,
  onCanPlay: () => void,
  onTimeUpdate: (t: number, d: number) => void,
  onEnded: () => void,
  videoRef: React.RefObject<HTMLVideoElement | null>
}) => {
  // Manage play/pause based on active state
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    if (isActive) {
      const playPromise = el.play()
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name !== 'AbortError') console.error("Playback failed", err)
        })
      }
    } else {
      el.pause()
      el.currentTime = 0
    }
  }, [isActive])

  // Manage src and loading
  useEffect(() => {
    const el = videoRef.current
    if (!el || !video) return

    // Only update if src is effectively different
    if (el.src !== video.url && !el.src.endsWith(video.url)) {
        el.src = video.url
        el.load()
    }
  }, [video?.url])

  // Manage volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
      muted={isMuted}
      loop
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      onCanPlay={onCanPlay}
      onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
      onEnded={onEnded}
    />
  )
})

SinglePlayer.displayName = 'SinglePlayer'

const VideoCircle = ({ className = '', backgroundVideoRef, onExpandChange }: VideoCircleProps) => {
  // 1. Data Source
  const { videos, loadVideos } = useYandexVideos({ autoLoad: true, initialDelayMs: 1000 })
  const [hasLoadedVideos, setHasLoadedVideos] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  // 2. State for Dual Buffering
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A')
  const [videoA, setVideoA] = useState<VideoAsset>(FALLBACK_VIDEO)
  const [videoB, setVideoB] = useState<VideoAsset>(FALLBACK_VIDEO)
  
  // 3. Playback State
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showMuteButton, setShowMuteButton] = useState(false)
  
  // Refs
  const videoRefA = useRef<HTMLVideoElement>(null)
  const videoRefB = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Derived
  const currentVideo = activePlayer === 'A' ? videoA : videoB
  const [isMobile, setIsMobile] = useState(false)

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initial Load Logic
  useEffect(() => {
    if (videos.length > 0 && !hasLoadedVideos) {
      // Pick random start video
      const random = videos[Math.floor(Math.random() * videos.length)]
      setVideoA(random)
      setActivePlayer('A')
      setHasLoadedVideos(true)
      // Sync background
      if (backgroundVideoRef?.current) {
        backgroundVideoRef.current.src = random.url
        backgroundVideoRef.current.load()
        backgroundVideoRef.current.play().catch(() => {})
      }
    }
  }, [videos, hasLoadedVideos, backgroundVideoRef])

  // Ensure videos are requested if somehow empty on click
  useEffect(() => {
      if (videos.length === 0) {
          void loadVideos()
      }
  }, [loadVideos, videos.length])

  // --- Event Handlers ---

  const handleRandomize = useCallback(() => {
    if (videos.length === 0) {
        void loadVideos()
        // Fallback if really no videos yet: just toggle interaction state to show feedback
        setIsRandomizing(true)
        setTimeout(() => setIsRandomizing(false), 500)
        return
    }

    setIsRandomizing(true)
    setIsTransitioning(true)

    // 1. Pick new video
    const currentId = activePlayer === 'A' ? videoA.id : videoB.id
    let nextVideo = videos[Math.floor(Math.random() * videos.length)]
    
    // Try to find different one
    if (nextVideo.id === currentId && videos.length > 1) {
        const others = videos.filter(v => v.id !== currentId)
        if (others.length > 0) {
            nextVideo = others[Math.floor(Math.random() * others.length)]
        }
    }

    // 2. Load into INACTIVE player
    if (activePlayer === 'A') {
        setVideoB(nextVideo)
        // Player B component will detect change and load
    } else {
        setVideoA(nextVideo)
        // Player A component will detect change and load
    }

    // The actual switch happens in the onCanPlay callback of the player

  }, [videos, activePlayer, videoA, videoB, loadVideos])


  // Callback when a player is ready to play
  const onPlayerCanPlay = useCallback((player: 'A' | 'B') => {
      // Only interesting if this player is the DESTINATION of a switch
      // i.e., if we are transitioning AND this player is NOT the active one yet (or we are forcing a switch)
      
      // Actually, simpler: if we are transitioning and we just loaded this player, switch to it.
      // But how do we know we just loaded it for *this* transition?
      // We can check if it matches the "next" video.
      
      // Let's rely on state:
      // If isTransitioning is true:
      //   If active is A, and B calls this -> Switch to B
      //   If active is B, and A calls this -> Switch to A
      
      setIsTransitioning(prev => {
          if (!prev) return false // Not transitioning, ignore

          if (activePlayer === 'A' && player === 'B') {
               // Switch to B
               setActivePlayer('B')
               // Sync background
               if (backgroundVideoRef?.current) {
                   backgroundVideoRef.current.src = videoB.url
                   backgroundVideoRef.current.play().catch(() => {})
               }
               setTimeout(() => {
                   setIsRandomizing(false)
                   setIsPlaying(true)
               }, 100) // Slight delay for visual smoothness
               return false // Stop transitioning
          }
          
          if (activePlayer === 'B' && player === 'A') {
               // Switch to A
               setActivePlayer('A')
               // Sync background
               if (backgroundVideoRef?.current) {
                   backgroundVideoRef.current.src = videoA.url
                   backgroundVideoRef.current.play().catch(() => {})
               }
               setTimeout(() => {
                   setIsRandomizing(false)
                   setIsPlaying(true)
               }, 100)
               return false // Stop transitioning
          }

          return prev // Keep waiting
      })

  }, [activePlayer, backgroundVideoRef, videoA, videoB])

  const handleTimeUpdate = useCallback((t: number, d: number) => {
      if (d > 0) setProgress((t / d) * 100)
  }, [])

  const handleCircleClick = () => {
      if (!isEnlarged) {
          setIsEnlarged(true)
          onExpandChange?.(true)
          setIsMuted(false)
          setShowMuteButton(true)
          setIsPlaying(true)
          
          // Auto hide mute
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
          hideTimeoutRef.current = setTimeout(() => setShowMuteButton(false), 3500)
      } else {
          setIsEnlarged(false)
          onExpandChange?.(false)
          setShowMuteButton(false)
      }
  }
  
  const handleMuteToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsMuted(!isMuted)
      
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = setTimeout(() => setShowMuteButton(false), 3000)
  }
  
  const handleMouseEnter = () => {
      if (isEnlarged) {
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
          setShowMuteButton(true)
          hideTimeoutRef.current = setTimeout(() => setShowMuteButton(false), 3500)
      }
  }
  
  const handleMouseLeave = () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      setShowMuteButton(false)
  }

  // --- Render ---

  if (!currentVideo) return null // Should not happen with fallback

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Container with Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: isEnlarged ? (isMobile ? 1.15 : 1.5) : 1,
        }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
        className="relative mx-auto"
        style={{
          marginTop: isEnlarged ? (isMobile ? '30px' : '100px') : '0',
          marginBottom: isEnlarged ? (isMobile ? '20px' : '80px') : '0',
          transition: 'margin 0.3s ease',
        }}
      >
        
        {/* --- Decor & Ripples (Ported from previous) --- */}
        <AnimatePresence>
          {isRandomizing && !prefersReducedMotion && (
            <>
             {[0, 0.3, 0.6, 0.9].map((delay, i) => (
                <motion.div
                  key={i}
                  initial={{ width: isMobile ? 176 : 220, height: isMobile ? 176 : 220, opacity: 0 }}
                  animate={{ 
                    width: isMobile ? [176, 600 + i*200] : [220, 800 + i*400],
                    height: isMobile ? [176, 600 + i*200] : [220, 800 + i*400],
                    opacity: [0, 0.8 - i*0.2, 0]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 + i*0.5, ease: 'easeOut', delay }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                  style={{ border: `1px solid ${colors.neon.red}`, boxShadow: `0 0 ${40 + i*20}px ${colors.neon.red}40` }}
                />
             ))}
            </>
          )}
        </AnimatePresence>

         {/* Subtle glow when playing */}
        <AnimatePresence>
          {isPlaying && !isEnlarged && !prefersReducedMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${colors.neon.red}20 0%, transparent 60%)`,
                filter: 'blur(40px)',
                transform: 'scale(1.4)',
              }}
            />
          )}
        </AnimatePresence>

        {/* --- Video Container --- */}
        <motion.div 
          className="relative w-[176px] h-[176px] md:w-[220px] md:h-[220px] cursor-pointer mx-auto"
          onClick={handleCircleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.02 }}
          animate={isRandomizing ? { scale: [1, 0.98, 1.02, 1] } : {}}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
           {/* Border */}
           <div className="absolute inset-0 rounded-full border-[3px] border-[#ff0040] overflow-hidden bg-black">
               
               {/* DUAL PLAYERS */}
               <SinglePlayer 
                   video={videoA} 
                   isActive={activePlayer === 'A'} 
                   isMuted={isMuted}
                   videoRef={videoRefA}
                   onCanPlay={() => onPlayerCanPlay('A')}
                   onTimeUpdate={handleTimeUpdate}
                   onEnded={() => { videoRefA.current?.play() }} // Loop manually if needed, or rely on attribute
               />
               <SinglePlayer 
                   video={videoB} 
                   isActive={activePlayer === 'B'} 
                   isMuted={isMuted}
                   videoRef={videoRefB}
                   onCanPlay={() => onPlayerCanPlay('B')}
                   onTimeUpdate={handleTimeUpdate}
                   onEnded={() => { videoRefB.current?.play() }}
               />

               {/* Transition Overlay */}
               <AnimatePresence>
                {isTransitioning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-[2px]"
                  >
                    {/* Portal Spinner */}
                    <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{ background: `conic-gradient(from 0deg, transparent, ${colors.neon.red}40, transparent)` }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mute Button */}
              <AnimatePresence>
                {isEnlarged && showMuteButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleMuteToggle}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/40 flex items-center justify-center border border-white/20 hover:bg-black/60 z-30"
                  >
                    {isMuted ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                        <line x1="23" y1="9" x2="17" y2="15"/>
                        <line x1="17" y1="9" x2="23" y2="15"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                         <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                         <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                         <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
              
              {/* Play Overlay (when paused and not enlarged) */}
              <AnimatePresence>
                {!isPlaying && !isEnlarged && !isTransitioning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20 pointer-events-none"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* Progress Ring */}
           {!prefersReducedMotion && (
             <VideoCircleProgress
               progress={progress}
               duration={30} // Estimate or use actual if available
               currentTime={0}
               isPlaying={isPlaying}
             />
           )}

        </motion.div>
      </motion.div>

      {/* Randomizer Button */}
      <motion.div
        animate={{ y: isEnlarged ? (isMobile ? 20 : 30) : 0 }}
        className="relative z-0"
      >
        <VideoCircleButton
          onClick={handleRandomize}
          isLoading={isTransitioning}
          isRandomizing={isRandomizing}
          className="mt-6"
        />
      </motion.div>

      {/* Hint Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: (isEnlarged && isMobile) ? 0 : (isMobile ? 0.7 : 0.5), 
          y: isEnlarged ? (isMobile ? 15 : 30) : 0 
        }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/40 sm:text-white/30 text-xs mt-4 tracking-widest uppercase"
        style={{ display: (isEnlarged && isMobile) ? 'none' : 'block' }}
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
