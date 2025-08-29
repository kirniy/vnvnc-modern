import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { colors } from '../utils/colors'
// import WarpedVNVNC from './logo/WarpedVNVNC' - replaced with HTML text for performance

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navItems = [
    { name: 'главная', path: '/' },
    { name: 'афиша', path: '/events' },
    { name: 'галерея', path: '/gallery' },
    { name: 'правила', path: '/rules' },
    { name: 'бронирование', path: '/reservations' },
    { name: 'аренда', path: '/rental' },
    { name: 'контакты', path: '/contact' },
  ]

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 pt-safe pr-safe pl-safe ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always visible for symmetry with hamburger menu */}
          <Link 
            to="/" 
            className="flex items-center group pl-2 sm:pl-0 transition-all duration-300"
          >
            <div className="relative flex items-center">
              <span 
                className={`font-display font-extrabold text-2xl lowercase transition-all duration-300 group-hover:scale-[1.03] ${
                  scrolled ? 'drop-shadow-[0_0_15px_rgba(255,0,64,0.5)]' : ''
                }`}
                style={{ color: colors.neon.red }}
              >
                vnvnc
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 font-display">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? ''
                    : 'text-white/80 hover:text-white'
                }`}
                style={location.pathname === item.path ? { color: colors.neon.red } : {}}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ 
                      backgroundColor: colors.neon.red,
                      boxShadow: `0 0 20px ${colors.neon.red}`
                    }}
                    layoutId="underline"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white transition-colors p-3 -mr-2"
              style={{ ':hover': { color: colors.neon.red } } as any}
            >
              {isOpen ? <X size={24} style={{ color: colors.neon.red }} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-[70] bg-black/95 overflow-y-auto pt-safe pb-safe"
            style={{ height: '100vh', maxHeight: '100vh' }}
          >
            {/* Animated red gradient background */}
            <style>{`
              @keyframes vnvnc-sweep { 0%{transform: translateX(-30%)} 50%{transform: translateX(30%)} 100%{transform: translateX(-30%)} }
            `}</style>
            <div className="absolute -inset-20 opacity-20 pointer-events-none" style={{
              background: `radial-gradient(800px 400px at 20% 30%, ${colors.neon.red}44, transparent 70%), radial-gradient(800px 400px at 80% 70%, ${colors.neon.red}22, transparent 70%)`,
              filter: 'blur(12px)'
            }} />
            {/* Solid scrim to guarantee readability over content */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div style={{
                position: 'absolute', inset: '-40% -60%', background: `linear-gradient(90deg, transparent, ${colors.neon.red}22, transparent)`, height: '140%', transform: 'translateX(-30%)', animation: 'vnvnc-sweep 7s ease-in-out infinite'
              }} />
            </div>

            {/* Close button */}
            <button
              aria-label="Закрыть меню"
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-4 radius border-2 border-white text-white font-display font-extrabold hover:bg-white hover:text-black transition-colors z-[80]"
            >
              <X size={18} />
            </button>

            {/* Backdrop close area */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            {/* Items */}
            <div className="absolute inset-0 px-6 py-16 flex pointer-events-none overflow-y-auto">
              <div className="flex flex-col gap-4 pointer-events-auto min-h-full w-full justify-center max-h-[calc(100vh-8rem)]">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="w-full radius h-12 border-2 border-white text-white px-4 font-display font-extrabold text-lg lowercase text-center flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation
