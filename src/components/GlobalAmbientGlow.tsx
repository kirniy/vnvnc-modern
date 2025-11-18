import { colors } from '../utils/colors'

const GlobalAmbientGlow = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
       {/* Static Red Ambient Glow - No Animation for Performance */}
       <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[40vh] opacity-20"
          style={{ 
            background: `radial-gradient(ellipse at center top, ${colors.neon.red}, transparent 70%)`,
            filter: 'blur(60px)',
            willChange: 'transform' // Optimization hint
          }}
       />
    </div>
  )
}

export default GlobalAmbientGlow
