import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { colors } from '../../utils/colors'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
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
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl'
    }
    
    const borderStyles = border ? 'border border-white/10' : ''
    const glowStyles = glow ? 'shadow-neon' : ''
    
    const { onDrag, onDragEnd, onDragStart, onAnimationStart, ...restProps } = props
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 transition-all duration-300',
          variants[variant],
          blurStyles[blur],
          borderStyles,
          glowStyles,
          '',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={variantStyles[variant]}
        whileHover={{ backgroundColor: colors.glass.whiteHover }}
        {...restProps}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard