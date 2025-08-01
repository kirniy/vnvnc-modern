import { colors } from '../../utils/colors'

interface CornerBracketsProps {
  children: React.ReactNode
  color?: string
  size?: number
  className?: string
}

const CornerBrackets = ({ 
  children, 
  color = colors.neon.greenBright,
  size = 16,
  className = ''
}: CornerBracketsProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Top Left */}
      <div 
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M6 2H2v4M2 6v12" stroke={color} strokeWidth="2" />
        </svg>
      </div>
      
      {/* Top Right */}
      <div 
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M18 2h4v4m0-4v12" stroke={color} strokeWidth="2" />
        </svg>
      </div>
      
      {/* Bottom Left */}
      <div 
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M6 22H2v-4m0 4V6" stroke={color} strokeWidth="2" />
        </svg>
      </div>
      
      {/* Bottom Right */}
      <div 
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M18 22h4v-4m0 4V6" stroke={color} strokeWidth="2" />
        </svg>
      </div>
      
      {children}
    </div>
  )
}

export default CornerBrackets