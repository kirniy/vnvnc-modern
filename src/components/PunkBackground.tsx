import { useEffect, useRef } from 'react'

// Лёгкий, «панковский» глобальный фон: диагональные полосы, царапины и красные вспышки
// Производительный Canvas 2D, без зависимостей
const PunkBackground = () => {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d', { alpha: true })!
    let w = 0, h = 0
    const DPR = Math.min(devicePixelRatio || 1, 2)

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = Math.floor(w * DPR)
      canvas.height = Math.floor(h * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const scratches = Array.from({ length: 18 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 80 + Math.random() * 240,
      a: Math.random() * Math.PI,
      alpha: 0.05 + Math.random() * 0.08,
      speed: 0.15 + Math.random() * 0.35,
    }))

    const tick = (t: number) => {
      // time variable kept implicit
      ctx.clearRect(0, 0, w, h)

      // фон: мягкие диагональные полосы
      const stripeWidth = 12
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 0.06
      ctx.translate(-((t / 40) % stripeWidth), 0)
      for (let x = -w; x < w * 2; x += stripeWidth) {
        ctx.fillStyle = 'rgba(255,255,255,1)'
        ctx.fillRect(x, 0, 1, h)
      }
      ctx.restore()

      // красные вспышки (медленные, плавные)
      ctx.globalCompositeOperation = 'screen'
      for (let i = 0; i < 3; i++) {
        const cx = (Math.sin((t / 5000) + i) * 0.5 + 0.5) * w
        const cy = (Math.cos((t / 7000) + i * 1.7) * 0.5 + 0.5) * h
        const r = Math.max(w, h) * 0.25
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        g.addColorStop(0, 'rgba(255,26,26,0.10)')
        g.addColorStop(1, 'rgba(255,26,26,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // царапины — редкие, дрейфуют
      ctx.globalCompositeOperation = 'overlay'
      scratches.forEach(s => {
        s.x += Math.cos(s.a) * s.speed
        s.y += Math.sin(s.a) * s.speed
        if (s.x < -200) s.x = w + 200
        if (s.x > w + 200) s.x = -200
        if (s.y < -200) s.y = h + 200
        if (s.y > h + 200) s.y = -200
        ctx.strokeStyle = `rgba(255,255,255,${s.alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x + Math.cos(s.a) * s.len, s.y + Math.sin(s.a) * s.len)
        ctx.stroke()
      })

      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      ro.disconnect()
    }
  }, [])

  // Отключён: заменён SVG BackgroundShader как более лёгкий вариант
  return null
}

export default PunkBackground


