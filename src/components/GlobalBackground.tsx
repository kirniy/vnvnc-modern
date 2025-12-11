import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#020617] overflow-hidden">

      {/* 1. Deep "Aurora Pulse" Background - The light source behind the ice */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: 'linear-gradient(to bottom, #0f172a 0%, #020617 100%)'
          }}
        />
        {/* Moving blobs of color */}
        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] animate-aurora-pulse opacity-50 mix-blend-screen">
          <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-900 blur-[150px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[60%] h-[60%] rounded-full bg-blue-900 blur-[130px]" />
          <div className="absolute top-[40%] right-[30%] w-[40%] h-[40%] rounded-full bg-indigo-900 blur-[100px]" />
        </div>
      </div>

      {/* 2. THE TEXTURE: "Refractive Ice" - SVG Filter Magic */}
      {/* Creates a high-fidelity 'cracked ice' / 'frost' surface over the colors */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.6] mix-blend-overlay z-10" preserveAspectRatio="none">
        <filter id="ice-fractal">
          {/* Create organic noise */}
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="noise" />
          {/* Sharpen into 'crystals' */}
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" in="noise" result="crystals" />
          {/* Add 'shine' / specular highlights to the crystals */}
          <feSpecularLighting in="crystals" surfaceScale="8" specularConstant="1.4" specularExponent="20" lightingColor="#ffffff" result="shine">
            <fePointLight x="50%" y="0%" z="300" />
          </feSpecularLighting>
          {/* Composite the shine over the crystals */}
          <feComposite in="shine" in2="crystals" operator="in" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ice-fractal)" />
      </svg>

      {/* 3. Frost Vignette - Icy edges */}
      <div
        className="absolute inset-0 z-20"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(2, 6, 23, 0.3) 80%, rgba(185, 228, 253, 0.05) 95%, rgba(2, 6, 23, 0.8) 100%)'
        }}
      />

      {/* 4. "Diamond Dust" - Tiny sparkling specs (CSS) */}
      <div className="absolute inset-0 z-10 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay brightness-150 contrast-150" />

      <style>{`
        @keyframes aurora-pulse {
            0% { transform: scale(1) rotate(0deg); opacity: 0.4; }
            50% { transform: scale(1.1) rotate(2deg); opacity: 0.6; }
            100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
        }
        .animate-aurora-pulse {
            animation: aurora-pulse 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
