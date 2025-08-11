import { useEffect, useRef } from 'react'

/**
 * Экономичный Canvas‑бэкграунд в стиле BRAT: красные «метаболлы»/боки, мягкие вспышки,
 * зерно и сканлайны. Работает только в зоне хиро.
 */
import { shouldUseHeavyFX } from '../utils/perf'

const BackgroundFX = ({ intensity = 1 }: { intensity?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const runningRef = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d', { alpha: true })!
    let width = 0
    let height = 0
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    const heavy = shouldUseHeavyFX()
    const blobCount = heavy ? Math.floor(8 * intensity) : Math.floor(3 * intensity)
    const blobs = Array.from({ length: blobCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 60 + Math.random() * 160,
      vx: (Math.random() * 2 - 1) * 0.08,
      vy: (Math.random() * 2 - 1) * 0.08,
      ph: Math.random() * Math.PI * 2,
    }))

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * DPR)
      canvas.height = Math.floor(height * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (t: number) => {
      if (!runningRef.current) return
      ctx.clearRect(0, 0, width, height)

      // мягкий тёмный фон, чтобы усилить красные пятна
      ctx.globalCompositeOperation = 'source-over'
       const grad = ctx.createRadialGradient(width * 0.5, height * 0.6, 0, width * 0.5, height * 0.6, Math.max(width, height))
      grad.addColorStop(0, 'rgba(0,0,0,0.2)')
      grad.addColorStop(1, 'rgba(0,0,0,0.6)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // красные «блики»
      ctx.globalCompositeOperation = 'lighter'
      blobs.forEach((b) => {
        b.x += b.vx * 0.6
        b.y += b.vy * 0.6
        if (b.x < -0.1 || b.x > 1.1) b.vx *= -1
        if (b.y < -0.1 || b.y > 1.1) b.vy *= -1
        const px = b.x * width
        const py = b.y * height
        const r = b.r * (0.8 + 0.2 * Math.sin(t * 0.001 + b.ph))
        const g = ctx.createRadialGradient(px, py, 0, px, py, r)
                g.addColorStop(0, 'rgba(255,26,26,0.35)')
                g.addColorStop(1, 'rgba(255,26,26,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fill()
      })

      // зерно
       ctx.globalCompositeOperation = 'overlay'
              const grainDensity = (heavy ? 0.04 : 0.015) * intensity
      for (let j = 0; j < width * grainDensity; j++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const a = Math.random() * 0.09
                ctx.fillStyle = `rgba(255,26,26,${a})`
        ctx.fillRect(x, y, 1, 1)
      }

      // сканлайны
       ctx.globalCompositeOperation = 'soft-light'
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      const lineStep = heavy ? 3 : 5
      for (let y = 0; y < height; y += lineStep) {
        ctx.fillRect(0, y, width, 1)
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    const onVisibility = () => {
      runningRef.current = document.visibilityState === 'visible'
      if (runningRef.current && !rafRef.current) rafRef.current = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intensity])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

export default BackgroundFX


