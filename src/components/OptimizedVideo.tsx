import { useEffect, useRef, useState } from 'react'

interface OptimizedVideoProps {
  mobileSrc: string
  desktopSrc: string
  className?: string
  opacity?: number
}

/**
 * Performance-optimized video background component
 * - Uses lower quality for mobile/slow connections
 * - Pauses when tab is not visible
 * - Lightweight and fast loading
 */
const OptimizedVideo = ({ mobileSrc, desktopSrc, className = '', opacity = 0.15 }: OptimizedVideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoSrc, setVideoSrc] = useState<string>('')

  useEffect(() => {
    // Determine video source based on device/connection
    const isMobile = window.innerWidth < 768
    const isSlowConnection = 'connection' in navigator && 
      (navigator as any).connection?.effectiveType && 
      ['slow-2g', '2g', '3g'].includes((navigator as any).connection.effectiveType)
    
    // Use mobile version for mobile devices or slow connections
    setVideoSrc(isMobile || isSlowConnection ? mobileSrc : desktopSrc)
  }, [mobileSrc, desktopSrc])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Control playback based on page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
      } else {
        video.play().catch(() => {
          // Autoplay might be blocked, that's ok
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Start playing immediately
    video.play().catch(() => {})

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [videoSrc])

  if (!videoSrc) return null

  return (
    <div className={className}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata" // Light preload for faster start
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          opacity,
          // Enhance video appearance
          filter: 'contrast(1.1) brightness(1.05) saturate(1.2)',
          // Hardware acceleration hints
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  )
}

export default OptimizedVideo