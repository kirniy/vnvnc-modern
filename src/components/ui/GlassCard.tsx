import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'
import { colors } from '../../utils/colors'

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: 'light' | 'dark' | 'neon'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  glow?: boolean
  children: React.ReactNode
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({
    className,
    variant = 'light',
    blur = 'md',
    border = true,
    glow = false,
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
      sm: 'backdrop-blur-[2px]',
      md: 'backdrop-blur-[4px]',
      lg: 'backdrop-blur-[8px]',
      xl: 'backdrop-blur-[12px]'
    }

    const borderStyles = border ? 'border border-white/10' : ''
    const glowStyles = glow ? 'shadow-neon' : ''

    const { onDrag, onDragEnd, onDragStart, onAnimationStart, ...restProps } = props

    const interactiveStyles = props.onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl transition-all duration-300 group',
          variants[variant],
          blurStyles[blur],
          borderStyles,
          glowStyles,
          interactiveStyles,
          // Footer-style hover effect if variant is 'neon' or explicit 'hoverEffect' prop (if we added it, but let's stick to variant or just default behavior for interactive cards)
          // Let's add specific hover classes that match the footer's "classy" look
          'hover:border-neon-red/30 hover:bg-white/10',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={variantStyles[variant]}
        {...restProps}
      >
        {/* Inner Gradient Glow on Hover (Footer style) */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

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