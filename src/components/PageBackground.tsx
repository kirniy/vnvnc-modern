import { Component as AnimatedBackground } from './ui/raycast-animated-background'
import { useMemo } from 'react'

interface PageBackgroundProps {
  variant?: 'left' | 'right' | 'random'
}

export const PageBackground = ({ variant = 'random' }: PageBackgroundProps = {}) => {
  // Randomize the direction if variant is 'random'
  const transform = useMemo(() => {
    if (variant === 'random') {
      return Math.random() > 0.5 ? 'scaleX(-1)' : 'none'
    }
    return variant === 'right' ? 'scaleX(-1)' : 'none'
  }, [variant])

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      style={{
        filter: 'brightness(0.9)',
        transform: transform,
      }}
    >
      <AnimatedBackground />
    </div>
  )
}