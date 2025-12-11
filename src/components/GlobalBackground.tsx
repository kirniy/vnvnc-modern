import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0b1121] overflow-hidden">
      {/* 1. Deep "Glacial Lake" Base Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #0f172a 0%, #172554 40%, #020617 100%)',
          opacity: 1
        }}
      />

      {/* 2. Soft Aurora Glows (Atmosphere) */}
      <div className="absolute inset-0 opacity-60 mix-blend-screen">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-900/40 blur-[150px]" />
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-800/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[50%] rounded-full bg-indigo-900/30 blur-[100px]" />
      </div>

      {/* 3. "Glacial Fractures" - Large Organic SVG Shapes */}
      {/* No pattern, just huge abstract ice sheets drifting slowly */}
      <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" preserveAspectRatio="none">
        <defs>
          <linearGradient id="glacial-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
          <filter id="ice-blur">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        {/* Background Layer - Slow Drift */}
        <g className="animate-glacial-drift-slow">
          {/* Top Right Ice Sheet */}
          <path
            d="M100% 0 L60% 0 L80% 40% L100% 60% Z"
            fill="url(#glacial-gradient)"
          />
          {/* Bottom Left Ice Mass */}
          <path
            d="M0 100% L40% 100% L20% 60% L0 40% Z"
            fill="url(#glacial-gradient)"
          />
        </g>

        {/* Foreground Layer - Slightly Faster Drift */}
        <g className="animate-glacial-drift-medium">
          {/* Central Splinter */}
          <path
            d="M40% -10% L60% -10% L55% 30% L45% 30% Z"
            fill="white"
            fillOpacity="0.03"
            filter="url(#ice-blur)"
          />
        </g>
      </svg>

      {/* 4. Sharp "Cracks" Overlay - Crisp vectors for texture */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
        <path d="M-100 200 L400 -100" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
        <path d="M100% 300 L60% -100" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
        <path d="M30% 100% L80% 50%" stroke="white" strokeWidth="1" strokeOpacity="0.05" />
      </svg>

      {/* 5. Vignette (Dark edges for focus) */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.4) 80%, rgba(2, 6, 23, 0.8) 100%)',
        }}
      />

      <style>{`
        @keyframes glacial-drift-slow {
            0% { transform: translateY(0) scale(1.02); }
            50% { transform: translateY(-15px) scale(1.0); }
            100% { transform: translateY(0) scale(1.02); }
        }
        @keyframes glacial-drift-medium {
            0% { transform: translateY(0); }
            50% { transform: translateY(-25px); }
            100% { transform: translateY(0); }
        }
        .animate-glacial-drift-slow {
            animation: glacial-drift-slow 30s ease-in-out infinite;
        }
        .animate-glacial-drift-medium {
            animation: glacial-drift-medium 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
