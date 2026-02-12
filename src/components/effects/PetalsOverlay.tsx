import { useEffect, useRef } from 'react'

interface Petal {
  x: number
  y: number
  width: number
  height: number
  speed: number
  drift: number
  driftPhase: number
  driftSpeed: number
  rotation: number
  rotationSpeed: number
  opacity: number
  hue: number // 340-360 range for pinks/reds
  saturation: number
}

const PetalsOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getPetalCount = (w: number) => {
    if (w < 768) return 22
    if (w < 1280) return 45
    return 65
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as any)?.connection as { saveData?: boolean } | undefined
    const saveData = Boolean(connection?.saveData)
    const prefersReducedMotion = motionQuery?.matches ?? false

    const handleResize = () => {
      if (canvas) {
        const vw = window.visualViewport?.width || window.innerWidth
        const vh = window.visualViewport?.height || window.innerHeight
        canvas.width = vw
        canvas.height = vh
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize, { passive: true })
    if (motionQuery?.addEventListener) {
      motionQuery.addEventListener('change', handleResize)
    } else if (motionQuery?.addListener) {
      motionQuery.addListener(handleResize)
    }

    const allowAnimation = !prefersReducedMotion && !saveData
    const targetFps = allowAnimation
      ? (window.innerWidth < 768 ? 30 : 40)
      : 0

    const maxPetals = allowAnimation
      ? getPetalCount(window.innerWidth)
      : Math.min(10, getPetalCount(window.innerWidth))
    const petals: Petal[] = []

    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      width: Math.random() * 7 + 4,   // 4-11px wide
      height: Math.random() * 4 + 3,   // 3-7px tall
      speed: Math.random() * 0.7 + 0.25,
      drift: Math.random() * 0.5 - 0.25,
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.006 + 0.003,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      opacity: Math.random() * 0.4 + 0.2,
      hue: Math.random() * 30 + 340,       // 340-370 (wraps to pinks/reds)
      saturation: Math.random() * 25 + 65,  // 65-90%
    })

    for (let i = 0; i < maxPetals; i++) {
      petals.push(createPetal())
    }

    let animationFrameId: number
    let lastFrame = performance.now()

    const drawPetal = (p: Petal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.beginPath()
      // Draw a petal shape: two bezier curves forming a leaf/petal
      ctx.moveTo(0, -p.height)
      ctx.bezierCurveTo(
        p.width * 0.8, -p.height * 0.5,
        p.width * 0.8, p.height * 0.5,
        0, p.height
      )
      ctx.bezierCurveTo(
        -p.width * 0.8, p.height * 0.5,
        -p.width * 0.8, -p.height * 0.5,
        0, -p.height
      )
      const hue = p.hue % 360
      ctx.fillStyle = `hsla(${hue}, ${p.saturation}%, 75%, ${p.opacity})`
      ctx.fill()
      ctx.restore()
    }

    const drawFrame = (timestamp: number) => {
      if (allowAnimation && timestamp - lastFrame < 1000 / targetFps) {
        animationFrameId = requestAnimationFrame(drawFrame)
        return
      }

      lastFrame = timestamp
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      petals.forEach((p) => {
        if (allowAnimation) {
          p.y += p.speed
          p.driftPhase += p.driftSpeed
          p.x += p.drift + Math.sin(p.driftPhase) * 0.4
          p.rotation += p.rotationSpeed

          if (p.y > canvas.height + 10) {
            p.y = -10
            p.x = Math.random() * canvas.width
          }
          if (p.x > canvas.width + 10) {
            p.x = -10
          } else if (p.x < -10) {
            p.x = canvas.width + 10
          }
        }

        drawPetal(p)
      })

      if (!allowAnimation) return
      animationFrameId = requestAnimationFrame(drawFrame)
    }

    animationFrameId = requestAnimationFrame(drawFrame)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (motionQuery?.removeEventListener) {
        motionQuery.removeEventListener('change', handleResize)
      } else if (motionQuery?.removeListener) {
        motionQuery.removeListener(handleResize)
      }
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'normal' }}
    />
  )
}

export default PetalsOverlay
