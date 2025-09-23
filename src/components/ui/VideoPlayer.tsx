import React, { useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../../utils/colors'

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [showControls, setShowControls] = useState<boolean>(true)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(isFinite(prog) ? prog : 0)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = (x / rect.width) * 100
    const time = (percent / 100) * (videoRef.current.duration || 0)
    if (isFinite(time)) videoRef.current.currentTime = time
    setProgress(percent)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen().catch(console.error)
    }
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden radius-lg video-player-container ${className}`}
      style={{ backgroundColor: colors.glass.darker }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <video
        ref={videoRef}
        className="w-full video-player-element"
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        style={{ maxHeight: '500px' }}
      />

      {/* Neon Play Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={togglePlay}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          >
            <div
              className="p-6 rounded-full cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: colors.neon.red,
                boxShadow: `0 0 40px ${colors.neon.red}`
              }}
            >
              <Play size={40} className="text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
            }}
          >
            {/* Progress Bar */}
            <div
              className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3"
              onClick={handleSeek}
            >
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: colors.neon.red,
                  boxShadow: `0 0 10px ${colors.neon.red}`
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full transition-all duration-300 hover:bg-white/10"
                  style={{ color: colors.neon.red }}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {/* Volume */}
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full transition-all duration-300 hover:bg-white/10"
                  style={{ color: colors.neon.red }}
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full transition-all duration-300 hover:bg-white/10"
                style={{ color: colors.neon.red }}
              >
                <Maximize2 size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default VideoPlayer