import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { colors } from '../utils/colors'

interface CountdownTimerProps {
  targetDate: Date
  className?: string
}

const CountdownTimer = ({ targetDate, className = '' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock size={16} style={{ color: colors.neon.red }} />
        <span className="text-white/70 text-sm">Событие началось!</span>
      </div>
    )
  }

  const timeUnits = [
    { label: 'дн', value: timeLeft.days, show: timeLeft.days > 0 },
    { label: 'ч', value: timeLeft.hours, show: true },
    { label: 'м', value: timeLeft.minutes, show: true },
    { label: 'с', value: timeLeft.seconds, show: timeLeft.days === 0 }
  ]

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {timeUnits.filter(u => u.show).map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            <div 
              className="flex items-baseline px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10"
              style={{ backgroundColor: colors.glass.darker }}
            >
              <motion.span
                key={`${unit.label}-${unit.value}`}
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-white font-bold text-lg tabular-nums"
              >
                {unit.value.toString().padStart(2, '0')}
              </motion.span>
              <span className="text-white/40 text-xs ml-0.5">{unit.label}</span>
              
              {/* Urgent glow effect */}
              {timeLeft.days === 0 && timeLeft.hours < 12 && (
                <div 
                  className="absolute inset-0 rounded-lg animate-pulse pointer-events-none"
                  style={{
                    boxShadow: `0 0 15px ${colors.neon.red}33`,
                  }}
                />
              )}
            </div>
          </motion.div>
          
          {index < timeUnits.filter(u => u.show).length - 1 && (
            <span className="text-white/20 mx-0.5 text-lg">:</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default CountdownTimer