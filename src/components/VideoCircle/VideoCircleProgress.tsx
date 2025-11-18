import { memo } from 'react'
import { motion } from 'framer-motion'
import { colors } from '../../utils/colors'

interface VideoCircleProgressProps {
  progress: number
  duration: number
  currentTime: number
  isPlaying: boolean
}

const VideoCircleProgress = memo(({ 
  progress 
}: VideoCircleProgressProps) => {
  const radius = 98 // Radius for 200px diameter circle
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <>
      {/* SVG Progress Ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox="0 0 200 200"
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          stroke={colors.neon.red}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1, ease: 'linear' }}
          style={{
            filter: `drop-shadow(0 0 6px ${colors.neon.red})`,
          }}
        />
      </svg>

    </>
  )
})

VideoCircleProgress.displayName = 'VideoCircleProgress'

export default VideoCircleProgress