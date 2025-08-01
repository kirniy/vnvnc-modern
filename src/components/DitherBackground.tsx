import { Suspense, lazy } from 'react'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import './DitherBackground.css'

const Dither = lazy(() => import('./Dither'))

interface DitherBackgroundProps {
  className?: string
}

const DitherBackground = ({ className = '' }: DitherBackgroundProps) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  })

  return (
    <div ref={ref} className={`dither-background-container ${className}`}>
      {/* Only render Dither when visible */}
      {isIntersecting && (
        <Suspense fallback={null}>
          <div 
            className="dither-background-wrapper" 
            style={{ 
              filter: 'blur(6px)', // More blur for smoother appearance
              opacity: 0.6, // Slightly less opacity for subtlety
              transform: 'scale(1.1)' // Slight scale to prevent edge issues with blur
            }}
          >
            <Dither
              waveColor={[0.6, 0.15, 0.15]} // Red and black only, no white
              disableAnimation={false}
              enableMouseInteraction={false}
              mouseRadius={0.3}
              colorNum={3} // Less colors to avoid white
              waveAmplitude={0.35} // Slightly more dynamic
              waveFrequency={3.0} // Higher frequency for finer pattern
              waveSpeed={0.01} // Even slower for subtlety
              pixelSize={2} // Even smaller pixels for finer grain
            />
          </div>
        </Suspense>
      )}
      {/* Add a subtle overlay to further soften the effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.05) 100%)'
        }}
      />
    </div>
  )
}

export default DitherBackground