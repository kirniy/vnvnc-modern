import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { colors } from '../../utils/colors'

interface NeonTextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'red' | 'pink' | 'purple' | 'blue' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  glow?: boolean
  animate?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  children: React.ReactNode
}

const NeonText = forwardRef<HTMLElement, NeonTextProps>(
  ({ 
    className, 
    variant = 'red', 
    size = 'md',
    glow = true,
    animate = false,
    as: Component = 'span',
    children, 
    ...props 
  }, ref) => {
    const variants = {
      red: '',
      pink: '',
      purple: '',
      blue: '',
      gradient: 'bg-clip-text text-transparent'
    }
    
    const colorStyles = variant === 'gradient' ? {
      backgroundImage: 'linear-gradient(135deg, #ff0040 0%, #ff0080 50%, #8000ff 100%)'
    } : {
      color: variant === 'red' ? colors.neon.red :
             variant === 'pink' ? colors.neon.pink :
             variant === 'purple' ? colors.neon.purple :
             colors.neon.blue
    }
    
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-7xl'
    }
    
    const glowStyles = glow && variant !== 'gradient' ? {
      textShadow: variant === 'red' ? '0 0 20px #ff0040' :
                  variant === 'pink' ? '0 0 20px #ff0080' :
                  variant === 'purple' ? '0 0 20px #8000ff' :
                  '0 0 20px #00d4ff'
    } : {}
    
    const MotionComponent = motion[Component as keyof typeof motion] as any
    
    return (
      <MotionComponent
        ref={ref}
        className={cn(
          'font-display font-extrabold',
          variants[variant],
          sizes[size],
          animate && 'animate-pulse-neon',
          className
        )}
        style={{...colorStyles, ...glowStyles}}
        {...props}
      >
        {children}
      </MotionComponent>
    )
  }
)

NeonText.displayName = 'NeonText'

export default NeonText