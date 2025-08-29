import { Link } from 'react-router-dom'
import { Calendar, Ticket } from 'lucide-react'
import BratButton from './ui/BratButton'
import OptimizedVideo from './OptimizedVideo'
import { colors } from '../utils/colors'

const LiquidHero = () => {

  return (
    <section className="relative min-h-[92svh] sm:min-h-[86svh] min-h-[560px] flex items-center justify-center overflow-hidden pb-8 pt-safe pb-safe">
      {/* Optimized video background */}
      <OptimizedVideo
        mobileSrc="/herovideo-mobile.mp4"
        desktopSrc="/herovideo-optimized.mp4"
        className="absolute inset-0"
        opacity={0.35}
      />
      
      {/* Subtle vignette for depth and focus */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

      {/* Liquid SVG headline */}
      <div className="relative z-10 w-full max-w-[1600px] px-4">
        <svg
          viewBox="0 0 1600 900"
          className="w-full h-auto"
        >
          <defs>
            <linearGradient id="accentGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={colors.neon.red} />
              <stop offset="100%" stopColor="#b3002a" />
            </linearGradient>

            {/* Animated liquid filter for organic text movement */}
            <filter id="liquid" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.007 0.02"
                numOctaves={2}
                seed={3}
                result="noise"
              >
                <animate 
                  attributeName="baseFrequency" 
                  values="0.007 0.02;0.012 0.03;0.007 0.02" 
                  dur="7s" 
                  repeatCount="indefinite" 
                />
              </feTurbulence>
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="noise" 
                xChannelSelector="R" 
                yChannelSelector="G" 
                scale="18" 
              />
            </filter>

            {/* Glow filter for text */}
            <filter id="textGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <clipPath id="headlineClip">
              <rect x="40" y="160" width="1520" height="560" rx="12" />
            </clipPath>
          </defs>

          <g clipPath="url(#headlineClip)">
            <g filter="url(#liquid)">
              <text 
                x="800" 
                y="490" 
                textAnchor="middle"
                fontSize="260" 
                fontFamily="Unbounded, Bebas Neue, Impact, sans-serif" 
                letterSpacing="10" 
                fill="url(#accentGradient)"
                filter="url(#textGlow)"
              >
                VNVNC
              </text>
            </g>
          </g>
        </svg>

        {/* CTA buttons */}
        <div className="mt-6 w-full max-w-[560px] mx-auto px-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch">
          <Link to="/events" className="w-full">
            <BratButton className="w-full">
              <Calendar size={18} /> афиша
            </BratButton>
          </Link>
          <Link to="/reservations" className="w-full">
            <BratButton className="w-full">
              <Ticket size={18} /> бронь
            </BratButton>
          </Link>
        </div>

      </div>
    </section>
  )
}

export default LiquidHero