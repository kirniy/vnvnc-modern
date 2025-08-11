import { motion } from 'framer-motion'
import React from 'react'

type StickerProps = {
  children: React.ReactNode
  color?: 'red' | 'white' | 'black'
  size?: 'sm' | 'md' | 'lg'
  angle?: number
  className?: string
}

const colorMap = {
  red: {
    bg: '#ff0040',
    fg: '#ffffff',
  },
  white: {
    bg: '#ffffff',
    fg: '#000000',
  },
  black: {
    bg: '#000000',
    fg: '#ffffff',
  },
}

const sizeMap = {
  sm: { padX: 12, padY: 8, font: 12 },
  md: { padX: 16, padY: 10, font: 14 },
  lg: { padX: 20, padY: 12, font: 16 },
}

// Наклейка‑стикер. Для 18+ используем статичную версию без анимаций.
const Sticker: React.FC<StickerProps> = ({ children, color = 'red', size = 'md', angle = 0, className }) => {
  const { bg, fg } = colorMap[color]
  const s = sizeMap[size]
  return (
    <motion.div
      className={className}
      initial={false}
      whileHover={{}}
      style={{ rotate: `${angle}deg`, display: 'inline-block' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <motion.foreignObject
          x={0}
          y={0}
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <div
            style={{
              backgroundColor: bg,
              color: fg,
              padding: `${s.padY}px ${s.padX}px`,
              fontWeight: 800,
              fontFamily: 'Unbounded, Inter, sans-serif',
              fontSize: s.font,
              letterSpacing: 1,
              textTransform: 'lowercase',
              borderRadius: 12,
              boxShadow: `${bg}40 0px 12px 30px`,
              position: 'relative',
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
            {/* «Рваный» край */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 10,
                pointerEvents: 'none',
              }}
            >
              <path
                d="M0 6 Q 15 0 30 4 T 60 6 T 100 2 L100 40 L0 40 Z"
                fill={`${fg}08`}
              />
              <path d="M0 39 L100 35" stroke={`${fg}20`} strokeWidth={1} />
            </svg>
          </div>
        </motion.foreignObject>
      </svg>
    </motion.div>
  )
}

export default Sticker


