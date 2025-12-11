import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black">
      {/* Subtle winter gradient - pure CSS, no animations */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, rgba(8, 47, 73, 0.4) 0%, transparent 60%),
            radial-gradient(ellipse 100% 60% at 80% 20%, rgba(30, 58, 138, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(8, 47, 73, 0.2) 0%, transparent 50%),
            linear-gradient(to bottom, #000000, #030712)
          `
        }}
      />
      {/* Soft vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)'
        }}
      />
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
