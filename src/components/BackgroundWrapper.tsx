import React from 'react'
import Dither from './Dither'

interface BackgroundWrapperProps {
  children: React.ReactNode
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Dither Background - Fixed position behind everything */}
      <div className="fixed inset-0 z-0">
        <Dither
          waveColor={[0.8, 0.2, 0.2]} // Lighter red with softer tones
          disableAnimation={false}
          enableMouseInteraction={false}
          mouseRadius={0.3}
          colorNum={4} // More colors for prettier gradients
          waveAmplitude={0.25} // More dynamic waves
          waveFrequency={2.0} // Better pattern frequency
          waveSpeed={0.03} // Slightly faster for more life
          pixelSize={3} // Smaller pixels for more detail
        />
      </div>
      
      {/* Content overlay with proper z-index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default BackgroundWrapper
