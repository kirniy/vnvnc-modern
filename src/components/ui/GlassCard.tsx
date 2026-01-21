import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'
import { colors } from '../../utils/colors'
import { easing, duration, scale } from '../../utils/motion'

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: 'light' | 'dark' | 'neon'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  glow?: boolean
  /** Skip entry animation (useful when parent handles animation) */
  skipEntryAnimation?: boolean
  children: React.ReactNode
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({
    className,
    variant = 'light',
    blur = 'md',
    border = true,
    glow = false,
    skipEntryAnimation = false,
    children,
    ...props
  }, ref) => {
    const variants = {
      light: '',
      dark: '',
      neon: ''
    }

    const variantStyles = {
      light: { backgroundColor: colors.glass.white },
      dark: { backgroundColor: colors.glass.dark },
      neon: { backgroundImage: `linear-gradient(to bottom right, ${colors.neon.red}1A, ${colors.neon.purple}1A)` }
    }

    const blurStyles = {
      sm: 'backdrop-blur-[1px] sm:backdrop-blur-[2px]',
      md: 'backdrop-blur-[2px] sm:backdrop-blur-[4px]',
      lg: 'backdrop-blur-[4px] sm:backdrop-blur-[8px]',
      xl: 'backdrop-blur-[6px] sm:backdrop-blur-[12px]'
    }

    const borderStyles = border ? 'border border-white/10' : ''
    const glowStyles = glow ? 'shadow-neon' : ''

    const { onDrag, onDragEnd, onDragStart, onAnimationStart, ...restProps } = props

    // Interactive styles with proper scale values
    const interactiveStyles = props.onClick ? `cursor-pointer hover:scale-[${scale.cardHover}] active:scale-[${scale.cardTap}]` : ''

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl group',
          variants[variant],
          blurStyles[blur],
          borderStyles,
          glowStyles,
          interactiveStyles,
          'hover:border-neon-red/30 hover:bg-white/10',
          className
        )}
        // Only animate entry if not skipped
        initial={skipEntryAnimation ? false : { opacity: 0, y: 20 }}
        animate={skipEntryAnimation ? undefined : { opacity: 1, y: 0 }}
        transition={{
          // Use ease-out-quart for enter animation
          duration: duration.normal, // 240ms
          ease: easing.outQuart,
        }}
        style={variantStyles[variant]}
        {...restProps}
      >
        {/* Inner Gradient Glow on Hover - uses CSS transition with proper timing */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-neon-red/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            transition: `opacity ${duration.fast * 1000}ms cubic-bezier(0.165, 0.84, 0.44, 1)`
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard