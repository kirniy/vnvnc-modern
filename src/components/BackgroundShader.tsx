import { useEffect, useState } from 'react'
import { shouldUseHeavyFX, fxDisabled } from '../utils/perf'

const BackgroundShader = () => {
  const [heavy, setHeavy] = useState(false)
  const [baseFrequencyValue, setBaseFrequencyValue] = useState('0.002 0.0015')
  
  useEffect(() => {
    const isHeavy = shouldUseHeavyFX()
    setHeavy(isHeavy)
    setBaseFrequencyValue(isHeavy ? '0.0035 0.002' : '0.002 0.0015')
  }, [])
  
  if (fxDisabled()) return null
  
  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vnvnc-red" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#180a0a" />
            <stop offset="50%" stopColor="#210b0b" />
            <stop offset="100%" stopColor="#100707" />
          </linearGradient>
          <filter id="vnvnc-noise" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency={baseFrequencyValue || '0.002 0.0015'} numOctaves="2" seed="2" result="n" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" />
          </filter>
          <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="1" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="100%" height="100%" fill="url(#vnvnc-red)" />
        <rect x="0" y="0" width="100%" height="100%" filter="url(#vnvnc-noise)" />
        <rect x="0" y="0" width="100%" height="100%" fill="url(#scan)" />

        {/* мягкие красные пятна */}
        <radialGradient id="blobA">
          <stop offset="0%" stopColor="rgba(255,26,26,0.20)" />
          <stop offset="100%" stopColor="rgba(255,26,26,0)" />
        </radialGradient>
        {heavy ? (
          <>
            <circle cx="20%" cy="18%" r="22%" fill="url(#blobA)">
              <animate attributeName="cx" values="20%;80%;20%" dur="38s" repeatCount="indefinite"/>
              <animate attributeName="cy" values="18%;70%;18%" dur="42s" repeatCount="indefinite"/>
            </circle>
            <circle cx="85%" cy="78%" r="28%" fill="url(#blobA)">
              <animate attributeName="cx" values="85%;30%;85%" dur="52s" repeatCount="indefinite"/>
              <animate attributeName="cy" values="78%;35%;78%" dur="45s" repeatCount="indefinite"/>
            </circle>
          </>
        ) : (
          <>
            <circle cx="22%" cy="22%" r="22%" fill="url(#blobA)" />
            <circle cx="78%" cy="76%" r="26%" fill="url(#blobA)" />
          </>
        )}
      </svg>
    </div>
  )
}

export default BackgroundShader


