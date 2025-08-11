import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Ticket } from 'lucide-react'
import BratButton from './ui/BratButton'
import BackgroundFX from './BackgroundFX'
import { shouldUseVideoBG, shouldUseHeavyFX } from '../utils/perf'
import { colors } from '../utils/colors'

type Point = { x: number; y: number }

const LiquidHero = () => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const trailGroupRef = useRef<SVGGElement | null>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [burst, setBurst] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoActive, setVideoActive] = useState(false)

  // размеры для вычисления координат курсора в viewBox
  const viewBox = useMemo(() => ({ w: 1600, h: 900 }), [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * viewBox.w
      const y = ((e.clientY - rect.top) / rect.height) * viewBox.h
      const max = shouldUseHeavyFX() ? 10 : 6
      setPoints((prev) => {
        const next = [...prev, { x, y }]
        if (next.length > max) next.splice(0, next.length - max)
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

  // Активируем/останавливаем видео только когда блок в зоне видимости и устройство мощное
  useEffect(() => {
    const canShowVideo = shouldUseVideoBG()
    if (!canShowVideo) return setVideoActive(false)

    const el = sectionRef.current
    if (!el) return

    const io = new IntersectionObserver((entries) => {
      const entry = entries[0]
      setVideoActive(entry.isIntersecting)
    }, { rootMargin: '100px 0px 100px 0px', threshold: 0.01 })
    io.observe(el)

    const onVis = () => {
      const v = videoRef.current
      if (!v) return
      if (document.visibilityState === 'visible' && videoActive) {
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [videoActive])

  return (
    <section ref={sectionRef as any} className="relative min-h-[92svh] sm:min-h-[86svh] min-h-[560px] flex items-center justify-center overflow-hidden pb-8 pt-safe pb-safe">
      {/* Video background remains behind for mood */}
      <div className="absolute inset-0">
        {videoActive && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disableRemotePlayback
            className="absolute inset-0 w-full h-full object-cover opacity-20 will-change-transform"
            onPlay={(e) => {
              try { (e.currentTarget as HTMLVideoElement).playbackRate = shouldUseHeavyFX() ? 1 : 0.8 } catch {}
            }}
          >
            <source src="/herovideo.mp4" type="video/mp4" />
          </video>
        )}
        {/* noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 20%, rgba(255,0,64,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,0,64,0.05) 0%, transparent 50%)',
          }}
        />

        {/* BRAT‑style FX only for heavy devices */}
        {shouldUseHeavyFX() && <BackgroundFX intensity={0.8} />}
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
              <text
                x={viewBox.w / 2}
                y={viewBox.h / 2 + 40}
                textAnchor="middle"
                fontSize="260"
                fontFamily="Unbounded, Bebas Neue, Impact, sans-serif"
                letterSpacing="10"
                fill="url(#accentGradient)"
              >
                VNVNC
              </text>
            </g>
          </g>

          <g ref={trailGroupRef} id="trail">
            {points.map((p, i) => (
              <rect key={i} x={p.x - 8 - i} y={p.y - 2} width={16 + i * 2} height={4} fill={`${colors.neon.red}${(28 + i * 2).toString(16)}`} rx={2} />
            ))}
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
              <Ticket size={18} /> бронировать стол
            </BratButton>
          </Link>
        </div>

      </div>
    </section>
  )
}

export default LiquidHero


