import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Ticket } from 'lucide-react'
import BratButton from './ui/BratButton'
import BackgroundFX from './BackgroundFX'
import { colors } from '../utils/colors'

type Point = { x: number; y: number }

const LiquidHero = () => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const trailGroupRef = useRef<SVGGElement | null>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [burst, setBurst] = useState(false)

  // размеры для вычисления координат курсора в viewBox
  const viewBox = useMemo(() => ({ w: 1600, h: 900 }), [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * viewBox.w
      const y = ((e.clientY - rect.top) / rect.height) * viewBox.h
      setPoints((prev) => {
        const next = [...prev, { x, y }]
        if (next.length > 20) next.shift()
        return next
      })
    }

    svg.addEventListener('mousemove', handleMove)
    return () => svg.removeEventListener('mousemove', handleMove)
  }, [viewBox.w, viewBox.h])

  useEffect(() => {
    if (!burst) return
    const t = setTimeout(() => setBurst(false), 900)
    return () => clearTimeout(t)
  }, [burst])

  return (
    <section className="relative h-[88vh] min-h-[640px] flex items-center justify-center overflow-hidden bg-black">
      {/* Video background remains behind for mood */}
      <div className="absolute inset-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-25">
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>
        {/* noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 20%, rgba(255,0,64,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,0,64,0.05) 0%, transparent 50%)',
          }}
        />
        {/* BRAT‑style FX */}
        <BackgroundFX intensity={1} />
      </div>

      {/* Liquid SVG headline */}
      <div className="relative z-10 w-full max-w-[1600px] px-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
          role="img"
          className="w-full h-auto"
          aria-labelledby="heroTitle heroDesc"
        >
          <title id="heroTitle">VNVNC Liquid Headline</title>
          <desc id="heroDesc">Stretched, distorted headline with subtle grid and interactive trail</desc>

          <defs>
            <linearGradient id="accentGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={colors.neon.red} />
              <stop offset="100%" stopColor="#b3002a" />
            </linearGradient>

            <filter id="liquid" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={burst ? '0.015 0.03' : '0.007 0.02'}
                numOctaves={2}
                seed={3}
                result="noise"
              >
                <animate attributeName="baseFrequency" values="0.007 0.02;0.012 0.03;0.007 0.02" dur="7s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" xChannelSelector="R" yChannelSelector="G" scale={burst ? 28 : 18} />
            </filter>

            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 0 0 H 80 M 0 0 V 80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>

            <clipPath id="headlineClip">
              <rect x="40" y="160" width="1520" height="560" rx="12" />
            </clipPath>
          </defs>

          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />

          <g clipPath="url(#headlineClip)">
            <g filter="url(#liquid)">
              <text x="80" y="510" fontSize="260" fontFamily="Unbounded, Bebas Neue, Impact, sans-serif" letterSpacing="10" fill="url(#accentGradient)">
                VNVNC
              </text>
            </g>
          </g>

          <g ref={trailGroupRef} id="trail">
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={Math.max(2, i)} fill={`${colors.neon.red}${(20 + i * 2).toString(16)}`} />
            ))}
          </g>
        </svg>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/events">
            <BratButton>
              <Calendar size={18} /> афиша
            </BratButton>
          </Link>
          <Link to="/reservations">
            <BratButton>
              <Ticket size={18} /> бронировать стол
            </BratButton>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LiquidHero


