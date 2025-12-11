import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import vnvncLogo from '../assets/vnvnc-logo-classic-border.svg'

const CinematicLoader = () => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // "Curtain" stays closed for 2.2s, then opens
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 2200)
        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">

                    {/* Left Curtain Panel */}
                    <motion.div
                        initial={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
                        className="absolute left-0 top-0 bottom-0 w-[50%] z-10 border-r-2 border-[#4a0000] flex items-center justify-end overflow-hidden"
                        style={{
                            background: 'repeating-linear-gradient(90deg, #8a0000, #8a0000 10px, #5c0000 10px, #5c0000 20px)',
                            boxShadow: '0 0 50px #000'
                        }}
                    >
                    </motion.div>

                    {/* Right Curtain Panel */}
                    <motion.div
                        initial={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
                        className="absolute right-0 top-0 bottom-0 w-[50%] z-10 border-l-2 border-[#4a0000] flex items-center justify-start overflow-hidden"
                        style={{
                            background: 'repeating-linear-gradient(90deg, #8a0000, #8a0000 10px, #5c0000 10px, #5c0000 20px)',
                            boxShadow: '0 0 50px #000'
                        }}
                    >
                    </motion.div>

                    {/* Logo (Fades out as curtains open) */}
                    <motion.div
                        className="relative z-20 flex flex-col items-center justify-center"
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Glowing Backlight - Warm Gold for Velvet */}
                        <motion.div
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 blur-[60px] bg-orange-500/30 rounded-full"
                        />

                        {/* Main Logo Image */}
                        <motion.img
                            src={vnvncLogo}
                            alt="VNVNC"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="w-32 h-32 md:w-48 md:h-48 relative drop-shadow-2xl"
                            style={{
                                filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
                            }}
                        />
                    </motion.div>

                </div>
            )}
        </AnimatePresence>
    )
}

export default CinematicLoader
