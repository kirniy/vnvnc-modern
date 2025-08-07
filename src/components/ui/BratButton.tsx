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
    const base = 'inline-flex items-center gap-3 font-display font-extrabold tracking-wide rounded-[12px] transition-transform duration-150 select-none'
    const sizes = {
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }
    const styles =
      variant === 'solid'
        ? 'bg-[#ff0040] text-white border-2 border-[#ff0040]'
        : 'bg-transparent text-white border-2 border-white/85 hover:border-white'

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


