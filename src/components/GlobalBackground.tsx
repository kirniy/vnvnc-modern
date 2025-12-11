import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#020617] overflow-hidden">

      {/* Base gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: 'linear-gradient(to bottom, #0f172a 0%, #020617 100%)'
          }}
        />
        {/* Soft blobs of color - Optimized for performance (lower blur radius) */}
        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] animate-aurora-pulse opacity-30 mix-blend-screen">
          <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-900 blur-[80px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[60%] h-[60%] rounded-full bg-blue-900 blur-[60px]" />
          <div className="absolute top-[40%] right-[30%] w-[40%] h-[40%] rounded-full bg-indigo-900 blur-[50px]" />
        </div>
      </div>

      {/* Frost Vignette */}
      <div
        className="absolute inset-0 z-20"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(2, 6, 23, 0.3) 80%, rgba(185, 228, 253, 0.05) 95%, rgba(2, 6, 23, 0.8) 100%)'
        }}
      />

      {/* "Diamond Dust" */}
      <div className="absolute inset-0 z-10 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay brightness-150 contrast-150" />

      <style>{`
        @keyframes aurora-pulse {
            0% { transform: scale(1) rotate(0deg); opacity: 0.35; }
            50% { transform: scale(1.08) rotate(1.5deg); opacity: 0.55; }
            100% { transform: scale(1) rotate(0deg); opacity: 0.35; }
        }
        .animate-aurora-pulse {
            animation: aurora-pulse 16s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
