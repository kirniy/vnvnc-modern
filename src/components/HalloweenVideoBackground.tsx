import { useEffect, useRef, useState } from 'react'

interface HalloweenVideoBackgroundProps {
  sources?: string[]
  /** Optional additional darkening overlay (0..1) */
  overlayOpacity?: number
}

const DEFAULT_SOURCES = [
  '/1room1.mp4',
  '/1room2.mp4',
  '/room.mp4',
  '/room2.mp4',
]

/**
 * Fullscreen background with sequential video loop and soft crossfade.
 * Uses two stacked video tags to prepare the next source and fade seamlessly.
 */
const HalloweenVideoBackground = ({ sources = DEFAULT_SOURCES, overlayOpacity = 0.4 }: HalloweenVideoBackgroundProps) => {
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const [activeIndex, setActiveIndex] = useState<0 | 1>(0)
  const [currentSourceIdx, setCurrentSourceIdx] = useState<number>(0)

  // Shuffle helper to randomize playback order
  const shuffled = (arr: string[]) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const playlistRef = useRef<string[]>(shuffled(sources))

  // Prepare initial sources
  useEffect(() => {
    const a = videoARef.current
    const b = videoBRef.current
    if (!a || !b || sources.length === 0) return

    const list = (playlistRef.current = shuffled(sources))
    a.src = list[0]
    a.load()
    a.play().catch(() => {})

    // Preload next
    const nextIdx = (0 + 1) % list.length
    b.src = list[nextIdx]
    b.load()
  }, [sources])

  const handleEnded = async () => {
    const a = videoARef.current
    const b = videoBRef.current
    if (!a || !b) return

    const list = playlistRef.current
    const nextSourceIdx = (currentSourceIdx + 1) % list.length
    const inactive = activeIndex === 0 ? b : a
    const active = activeIndex === 0 ? a : b

    // Ensure next source is set
    inactive.src = list[nextSourceIdx]
    try { await inactive.play() } catch {}

    // Crossfade
    active.style.opacity = '0'
    inactive.style.opacity = '1'

    // Update state
    setActiveIndex(activeIndex === 0 ? 1 : 0)
    setCurrentSourceIdx(nextSourceIdx)

    // Preload the following source on the now-inactive element
    const followingIdx = (nextSourceIdx + 1) % list.length
    const nowInactive = activeIndex === 0 ? a : b
    nowInactive.src = list[followingIdx]
    nowInactive.load()
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Videos stacked */}
      <video
        ref={videoARef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ease-linear"
        muted
        playsInline
        autoPlay
        onEnded={handleEnded}
        style={{ opacity: activeIndex === 0 ? 1 : 0 }}
      />
      <video
        ref={videoBRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ease-linear"
        muted
        playsInline
        autoPlay
        onEnded={handleEnded}
        style={{ opacity: activeIndex === 1 ? 1 : 0 }}
      />
      {/* Dark overlay to keep content readable */}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayOpacity})` }} />
    </div>
  )
}

export default HalloweenVideoBackground


