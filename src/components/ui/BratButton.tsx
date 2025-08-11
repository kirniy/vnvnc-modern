import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

type BratButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'outline' | 'solid'
  size?: 'md' | 'lg'
}

// Жёсткая минималистичная кнопка в духе BRAT: жирный контур, без бликов, lowercase
const BratButton = forwardRef<HTMLButtonElement, BratButtonProps>(
  ({ className, variant = 'outline', size = 'lg', children, ...props }, ref) => {
    const base = 'btn-punk inline-flex items-center gap-3 transition-transform duration-150 whitespace-nowrap'
    const sizes = {
      md: 'px-6 py-3 text-base sm:text-lg',
      lg: 'px-8 py-4 text-lg',
    }
    const styles = variant === 'solid' ? 'bg-[#ff1a1a] text-white border-white' : ''

    const { onDrag, onDragEnd, onDragStart, onAnimationStart, ...rest } = props as any

    return (
      <motion.button
        ref={ref}
        className={cn(base, sizes[size], styles, className)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        {...rest}
      >
        {children}
      </motion.button>
    )
  }
)

BratButton.displayName = 'BratButton'

export default BratButton


