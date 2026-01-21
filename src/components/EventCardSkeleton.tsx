import { motion } from 'framer-motion'
import { easing } from '../utils/motion'

/**
 * Skeleton loading card for events
 * Uses shimmer animation instead of spinner for better UX
 * Based on web-animation-design principles
 */
const EventCardSkeleton = () => (
  <div className="relative aspect-[3/4] bg-dark-800 radius-lg overflow-hidden border border-white/10">
    {/* Shimmer effect - sweeps across the card */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
      animate={{ x: ['-100%', '200%'] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear', // Linear is correct for time-based/progress animations
        repeatDelay: 0.5,
      }}
    />

    {/* Image placeholder */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/[0.02]" />

    {/* Content placeholder at bottom */}
    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 bg-gradient-to-t from-black/90 to-transparent">
      {/* Title skeleton */}
      <div
        className="h-6 bg-white/10 rounded w-3/4"
        style={{ borderRadius: '6px' }}
      />

      {/* Date skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-white/10" />
        <div
          className="h-4 bg-white/5 rounded w-1/2"
          style={{ borderRadius: '4px' }}
        />
      </div>

      {/* Time skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-white/10" />
        <div
          className="h-4 bg-white/5 rounded w-1/3"
          style={{ borderRadius: '4px' }}
        />
      </div>
    </div>

    {/* Bottom action bar placeholder */}
    <div className="absolute bottom-0 left-0 right-0 p-4 pt-0">
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
        <div
          className="h-5 bg-white/5 rounded w-16"
          style={{ borderRadius: '4px' }}
        />
        <div
          className="h-9 bg-white/10 rounded w-24"
          style={{ borderRadius: '12px' }}
        />
      </div>
    </div>
  </div>
)

/**
 * Grid of skeleton cards for loading state
 */
export const EventCardSkeletonGrid = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          delay: i * 0.1,
          ease: easing.outQuart,
        }}
      >
        <EventCardSkeleton />
      </motion.div>
    ))}
  </div>
)

export default EventCardSkeleton
