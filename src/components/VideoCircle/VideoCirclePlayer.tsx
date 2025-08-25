import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { colors } from '../../utils/colors'

interface VideoCirclePlayerProps {
  src: string
  isPlaying: boolean
  isMuted: boolean
  onPlayPause: () => void
  onMuteToggle: () => void
  isLoading?: boolean
}

const VideoCirclePlayer = forwardRef<HTMLVideoElement, VideoCirclePlayerProps>(
  ({ src, isPlaying, isMuted, onPlayPause, onMuteToggle, isLoading }, ref) => {
    return (
      <>
        {/* Video Element */}
        <video
          ref={ref}
          src={src}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop={false}
          playsInline
          preload="metadata"
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Play/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayPause}
            className="relative w-full h-full flex items-center justify-center group"
            disabled={isLoading}
          >
            {/* Center play/pause icon */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isPlaying ? 0 : 1 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                {isPlaying ? (
                  <Pause size={20} className="text-white ml-0" />
                ) : (
                  <Play size={20} className="text-white ml-1" />
                )}
              </div>
            </motion.div>
          </motion.button>

          {/* Mute/Unmute Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onMuteToggle()
            }}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: isPlaying ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isMuted ? (
              <VolumeX size={14} className="text-white" />
            ) : (
              <Volume2 size={14} className="text-white" />
            )}
          </motion.button>
        </div>

        {/* Pulse effect on play */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              border: `2px solid ${colors.neon.red}`,
            }}
          />
        )}
      </>
    )
  }
)

VideoCirclePlayer.displayName = 'VideoCirclePlayer'

export default VideoCirclePlayer