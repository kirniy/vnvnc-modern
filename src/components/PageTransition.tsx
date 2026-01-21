import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { easing, duration } from '../utils/motion'

/**
 * Page transition wrapper component
 *
 * Based on web-animation-design principles:
 * - ease-out for entering (fast start, calm landing)
 * - Faster exit than enter (users want things gone quickly)
 * - Under 300ms for product UI
 */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal, // 240ms
      ease: easing.outQuart,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration.micro, // 120ms - faster exit
      ease: easing.outCubic,
    },
  },
}

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
)

/**
 * Fade-only variant for simpler transitions
 */
export const PageFade = ({ children, className }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{
      duration: duration.fast, // 180ms
      ease: easing.outQuart,
    }}
    className={className}
  >
    {children}
  </motion.div>
)

/**
 * Scale variant for modal-like pages
 */
export const PageScale = ({ children, className }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{
      duration: duration.normal,
      ease: easing.outQuart,
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export default PageTransition
