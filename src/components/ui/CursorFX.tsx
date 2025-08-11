import { useEffect, useRef, useState } from 'react'

/**
 * Лёгкий кастомный курсор: красная точка + кольцо‑следователь с плавным инерционным движением.
 * - Работает только на устройствах с точным указателем (мышь)
 * - Уважает prefers-reduced-motion
 * - Без тяжёлых DOM‑структур и canvas
 */
const CursorFX = () => {
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const target = useRef({ x: 0, y: 0 })
  const follower = useRef({ x: 0, y: 0 })
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduced) {
      setEnabled(false)
      return
    }

    const move = (e: MouseEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
      // Точку ставим сразу — ощущение отзывчивости
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`
      }
    }

    const click = () => {
      if (ringRef.current) {
        ringRef.current.animate(
          [
            { transform: `translate(${follower.current.x - 14}px, ${follower.current.y - 14}px) scale(1)` },
            { transform: `translate(${follower.current.x - 14}px, ${follower.current.y - 14}px) scale(1.35)` },
            { transform: `translate(${follower.current.x - 14}px, ${follower.current.y - 14}px) scale(1)` },
          ],
          { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' }
        )
      }
    }

    const tick = () => {
      const dx = target.current.x - follower.current.x
      const dy = target.current.y - follower.current.y
      follower.current.x += dx * 0.18
      follower.current.y += dy * 0.18
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${follower.current.x - 14}px, ${follower.current.y - 14}px)`
      }
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', click)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', click)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      {/* Точка */}
      <div
        ref={dotRef}
        className="w-1.5 h-1.5 rounded-full"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          background: '#ff1a1a',
          boxShadow: '0 0 8px rgba(255,26,26,0.8)',
          transform: 'translate(-100px,-100px)',
          transition: 'transform 40ms linear',
        }}
      />

      {/* Кольцо */}
      <div
        ref={ringRef}
        className="rounded-full"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 28,
          height: 28,
          border: '2px solid rgba(255,255,255,0.9)',
          boxShadow: '0 0 24px rgba(255,26,26,0.25)',
          mixBlendMode: 'screen',
          borderRadius: 9999,
          transform: 'translate(-100px,-100px)',
        }}
      />
    </div>
  )
}

export default CursorFX


