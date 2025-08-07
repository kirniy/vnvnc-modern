import { motion } from 'framer-motion'
import React from 'react'
import { colors } from '../../utils/colors'

type WarpedVNVNCProps = {
  height?: number
  color?: string
  glow?: boolean
  className?: string
  animated?: boolean
  tight?: boolean
}

/**
 * SVG логотип «VNVNC» с варпингом/растяжением, пригодный как замена изображения.
 * Использует фильтры SVG (feTurbulence + feDisplacementMap) и framer-motion
 * для лёгкой «жизни» в буквах. Полностью масштабируется по высоте.
 */
const WarpedVNVNC: React.FC<WarpedVNVNCProps> = ({
  height = 64,
  color = colors.neon.red,
  glow = true,
  className = '',
  animated = true,
  tight = false,
}) => {
  const viewBoxWidth = 600
  const viewBoxHeight = 180

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      role="img"
      aria-label="VNVNC"
      height={height}
      className={className}
      style={{
        width: 'auto',
        filter: glow ? `drop-shadow(0 0 18px ${color}) drop-shadow(0 0 36px ${color}66)` : undefined,
      }}
    >
      <defs>
        {/* Шум для «грязи» */}
        <motion.filter id="distort" x="-20%" y="-50%" width="140%" height="200%">
          <motion.feTurbulence
            type="fractalNoise"
            baseFrequency={0.012}
            numOctaves={3}
            seed={3}
            result="noise"
            animate={animated ? { baseFrequency: [0.01, 0.018, 0.012] } : undefined as any}
            transition={animated ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : undefined}
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={tight ? 6 : 12} xChannelSelector="R" yChannelSelector="G" />
        </motion.filter>

        {/* Гранж‑маска через штрихи */}
        <pattern id="scratch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <rect width="12" height="12" fill="white" />
          <g stroke="black" strokeWidth="2" opacity="0.12">
            <path d="M0 6H12" />
            <path d="M-3 2H15" />
            <path d="M-3 10H15" />
          </g>
        </pattern>

        <mask id="grungeMask">
          <rect width="100%" height="100%" fill="url(#scratch)" />
        </mask>
      </defs>

      {/* Дубли для эффекта «контур + заливка + смещение» */}
      <g filter="url(#distort)">
        {/* Толстый контур */}
        <motion.text
          x={viewBoxWidth / 2}
          y={tight ? 120 : 115}
          textAnchor="middle"
          fontFamily="Unbounded, Oswald, Bebas Neue, Impact, sans-serif"
          fontWeight={800}
          fontSize={tight ? 150 : 160}
          letterSpacing={tight ? 8 : 12}
          fill="none"
          stroke={color}
          strokeWidth={18}
          strokeLinejoin="round"
          initial={{ scaleX: 1 }}
          animate={animated ? { scaleX: [1.02, 0.98, 1.01, 1] } : undefined}
          transition={animated ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
        >
          VNVNC
        </motion.text>

        {/* Смещённая тень */}
        <text
          x={viewBoxWidth / 2 + 4}
          y={(tight ? 120 : 115) + 4}
          textAnchor="middle"
          fontFamily="Unbounded, Oswald, Bebas Neue, Impact, sans-serif"
          fontWeight={900}
          fontSize={tight ? 150 : 160}
          letterSpacing={tight ? 8 : 12}
          fill={`${color}33`}
          opacity={0.7}
          mask="url(#grungeMask)"
        >
          VNVNC
        </text>

        {/* Основная заливка с маской */}
        <motion.text
          x={viewBoxWidth / 2}
          y={tight ? 120 : 115}
          textAnchor="middle"
          fontFamily="Unbounded, Oswald, Bebas Neue, Impact, sans-serif"
          fontWeight={900}
          fontSize={tight ? 150 : 160}
          letterSpacing={tight ? 8 : 12}
          fill={color}
          mask="url(#grungeMask)"
          initial={{ skewX: 0 }}
          animate={animated ? { skewX: [4, -2, 3, 0] } : undefined}
          transition={animated ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
        >
          VNVNC
        </motion.text>
      </g>
    </motion.svg>
  )
}

export default WarpedVNVNC


