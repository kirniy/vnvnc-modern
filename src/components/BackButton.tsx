import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  to: string
  text?: string
}

const BackButton = ({ to, text = 'назад' }: BackButtonProps) => {
  return (
    <Link
      to={to}
      className="inline-flex items-center space-x-2 text-white hover:text-red-500 mb-6 transition-colors"
    >
      <ArrowLeft size={20} />
      <span className="lowercase">{text}</span>
    </Link>
  )
}

export default BackButton