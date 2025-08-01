import { motion } from 'framer-motion'
import { colors } from '../../utils/colors'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave'
}

const Skeleton = ({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) => {
  const baseClasses = 'relative overflow-hidden'
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  }

  const dimensions = {
    width: width || (variant === 'text' ? '100%' : '100px'),
    height: height || (variant === 'text' ? '1rem' : '100px')
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        ...dimensions,
        backgroundColor: colors.glass.dark,
        border: `1px solid ${colors.glass.white}`
      }}
    >
      {animation === 'pulse' ? (
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.glass.whiteHover}, transparent)`
          }}
        />
      ) : (
        <motion.div
          className="absolute inset-0 -translate-x-full"
          animate={{
            translateX: ['0%', '100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.glass.whiteHover}, transparent)`,
            width: '100%'
          }}
        />
      )}
    </div>
  )
}

// Event Card Skeleton
export const EventCardSkeleton = () => {
  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-lg border border-white/10"
           style={{ backgroundColor: colors.glass.dark }}>
        {/* Image skeleton */}
        <Skeleton variant="rectangular" width="100%" height="320px" className="aspect-[3/4]" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          <Skeleton variant="text" width="80%" height="24px" />
          <Skeleton variant="text" width="60%" height="16px" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton variant="text" width="80px" height="20px" />
            <Skeleton variant="rectangular" width="100px" height="40px" className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Gallery Item Skeleton
export const GalleryItemSkeleton = () => {
  return (
    <Skeleton 
      variant="rectangular" 
      width="100%" 
      className="aspect-square rounded-xl" 
      animation="wave"
    />
  )
}

export default Skeleton