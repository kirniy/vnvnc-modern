import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#020617]">
      {/* 1. Deep Atmospheric Base (Midnight/Navy) */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'linear-gradient(to bottom, #0f172a 0%, #020617 100%)'
        }}
      />

      {/* 2. "Northern Lights" / Ice Glows (Cyan & Purple hints) - Static but vibrant */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            radial-gradient(circle at 50% -20%, rgba(34, 211, 238, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 85% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 10% 40%, rgba(99, 102, 241, 0.08) 0%, transparent 40%)
          `
        }}
      />

      {/* 3. Cold Mist / Ground Fog */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60vh] opacity-30"
        style={{
          background: 'linear-gradient(to top, rgba(165, 243, 252, 0.1) 0%, transparent 100%)'
        }}
      />

      {/* 4. Frost/Noise Texture - Adds the "Wintry/Film" texture very cheaply */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* 5. Heavy Vignette for kinematic focus */}
      <div
        className="absolute inset-0 bg-radial-gradient"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.7) 100%)'
        }}
      />
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
