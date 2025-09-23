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
      className="fixed overflow-hidden"
      style={{
        filter: 'brightness(0.9)',
        transform: transform,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}
    >
      <AnimatedBackground />
      {/* 10% dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}