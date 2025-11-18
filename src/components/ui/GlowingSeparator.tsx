import { colors } from '../../utils/colors'

interface GlowingSeparatorProps {
  className?: string
}

const GlowingSeparator = ({ className = '' }: GlowingSeparatorProps) => {
  return (
    <div className={`relative h-px w-full ${className}`}>
      {/* Base line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Glowing overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-50 blur-[2px]"
        style={{ 
          background: `linear-gradient(90deg, transparent, ${colors.neon.red}, transparent)` 
        }}
      />
    </div>
  )
}

export default GlowingSeparator
