import { motion } from 'framer-motion'


const FrostedTitle = () => {
    return (
        <div className="relative z-10 py-8 md:py-16 flex flex-col items-center justify-center overflow-visible">
            {/* SVG Filter Definition */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <filter id="ice-texture" x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
                        <feGaussianBlur stdDeviation="0.5" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="1.2" />
                        </feComponentTransfer>
                    </filter>
                    <linearGradient id="ice-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#e0f6ff" />
                        <stop offset="100%" stopColor="#a5f3fc" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Main Title Container */}
            <div className="relative">
                {/* Glow Layer */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="font-display font-black text-6xl md:text-9xl tracking-tighter text-cyan-400 blur-2xl absolute inset-0 select-none"
                    aria-hidden="true"
                >
                    WINTER SAGA
                </motion.h1>

                {/* Textured Layer */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="font-display font-black text-6xl md:text-[9rem] tracking-tighter leading-none relative z-10 text-transparent bg-clip-text"
                    style={{
                        backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #e0f2fe 40%, #7dd3fc 100%)',
                        filter: 'url(#ice-texture) drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                        WebkitTextStroke: '2px rgba(255,255,255,0.6)'
                    }}
                >
                    WINTER<br className="md:hidden" /> SAGA
                </motion.h1>

                {/* Sharp Overlay for readability */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="font-display font-black text-6xl md:text-[9rem] tracking-tighter leading-none absolute inset-0 z-20 text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent pointer-events-none mix-blend-overlay"
                >
                    WINTER<br className="md:hidden" /> SAGA
                </motion.h1>
            </div>

            {/* Subtitle / Dates */}
            <motion.div
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={{ opacity: 1, letterSpacing: '0.3em' }}
                transition={{ duration: 1.5, delay: 1 }}
                className="mt-4 flex items-center gap-4"
            >
                <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-cyan-300" />
                <p className="text-cyan-100 font-light text-lg md:text-2xl uppercase tracking-[0.3em] font-mono text-shadow-glow">
                    26.12 — 11.01
                </p>
                <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-cyan-300" />
            </motion.div>
        </div>
    )
}

export default FrostedTitle
