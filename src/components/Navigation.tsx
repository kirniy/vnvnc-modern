import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { colors } from '../utils/colors'
import WarpedVNVNC from './logo/WarpedVNVNC'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { name: 'главная', path: '/' },
    { name: 'афиша', path: '/events' },
    { name: 'галерея', path: '/gallery' },
    { name: 'правила', path: '/rules' },
    { name: 'бронирование', path: '/reservations' },
    { name: 'контакты', path: '/contact' },
  ]

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative flex items-center overflow-visible">
              <WarpedVNVNC height={32} animated className="transition-transform duration-300 group-hover:scale-[1.03]" />
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
              className="text-white transition-colors"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-all duration-200 rounded-lg ${
                    location.pathname === item.path
                      ? ''
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                  style={location.pathname === item.path ? {
                    color: colors.neon.red,
                    backgroundColor: `${colors.neon.red}1A`
                  } : {}}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation
