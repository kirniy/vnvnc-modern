import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-black">
      {/* Base gradient - Pure CSS, no blur, no animation */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 20% 20%, #0891b215 0%, transparent 50%), radial-gradient(ellipse 80% 80% at 80% 80%, #1e3a8a10 0%, transparent 50%), linear-gradient(to bottom right, #000000, #0a0f1e, #051020)'
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* Bottom Ambient Glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, #06b6d420 0%, transparent 70%)' }}
      />
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
