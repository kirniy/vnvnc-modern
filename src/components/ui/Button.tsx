import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { colors } from '../../utils/colors'
import { easing, duration, scale } from '../../utils/motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'neon'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  pulse?: boolean
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    glow = false,
    pulse = false,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-display font-bold group rounded-[12px]'

    const variants = {
      primary: 'text-white',
      secondary: 'border-2 text-white',
      glass: 'backdrop-blur-md border border-white/10 text-white',
      neon: 'bg-transparent border-2'
    }

    const variantStyles = {
      primary: {
        backgroundColor: colors.neon.red,
        boxShadow: '0 4px 15px rgba(255, 0, 64, 0.4)'
      },
      secondary: {
        borderColor: colors.neon.red
      },
      glass: {
        backgroundColor: colors.glass.white
      },
      neon: {
        borderColor: colors.neon.red,
        color: colors.neon.red
      }
    }

    const hoverStyles = {
      primary: {
        backgroundColor: colors.neon.red,
        boxShadow: '0 8px 24px rgba(255, 0, 64, 0.7)'
      },
      secondary: {
        backgroundColor: colors.neon.red,
        borderColor: colors.neon.red
      },
      glass: {
        backgroundColor: colors.glass.whiteHover
      },
      neon: {
        backgroundColor: colors.neon.red,
        borderColor: colors.neon.red,
        color: 'white'
      }
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }

    const glowStyles = glow ? 'shadow-neon hover:shadow-neon-intense' : ''
    const pulseStyles = pulse ? 'animate-pulse-neon' : ''

    const { onDrag, onDragEnd, onDragStart, onAnimationStart, ...restProps } = props

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glowStyles,
          pulseStyles,
          className
        )}
        style={variantStyles[variant]}
        whileHover={{
          scale: scale.buttonHover, // 1.02 - reduced from 1.04 to prevent hover flicker
          ...hoverStyles[variant]
        }}
        whileTap={{
          scale: scale.buttonTap, // 0.98
        }}
        transition={{
          // Micro-fast for scale (button press feel)
          scale: { duration: duration.micro, ease: easing.outQuart },
          // Slightly slower for color/shadow transitions
          backgroundColor: { duration: duration.fast, ease: easing.outQuart },
          boxShadow: { duration: duration.fast, ease: easing.outQuart },
          borderColor: { duration: duration.fast, ease: easing.outQuart },
          color: { duration: duration.fast, ease: easing.outQuart },
        }}
        {...restProps}
      >
        <span className="px-1">{children}</span>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button