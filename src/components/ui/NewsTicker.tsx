import React, { useMemo } from 'react'

type NewsTickerProps = {
  text?: string
  speedMs?: number
  className?: string
}

// CSS‑только бесконечный маркер VNVNC x ... без тяжёлых зависимостей
const NewsTicker: React.FC<NewsTickerProps> = ({
  text = 'VNVNC × VNVNC × VNVNC × ',
  speedMs = 30000,
  className = '',
}) => {
  const repeated = useMemo(() => new Array(20).fill(text).join(' '), [text])

  return (
    <div className={`relative overflow-hidden ${className}`} aria-label="vnvnc news ticker">
      <style>{`
        @keyframes vnvnc-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="whitespace-nowrap will-change-transform"
        style={{
          animation: `vnvnc-marquee ${speedMs}ms linear infinite`,
          display: 'inline-block',
        }}
      >
        <span className="px-2 font-display font-extrabold tracking-wider lowercase">
          {repeated}
        </span>
        <span className="px-2 font-display font-extrabold tracking-wider lowercase" aria-hidden>
          {repeated}
        </span>
      </div>
    </div>
  )
}

export default NewsTicker


