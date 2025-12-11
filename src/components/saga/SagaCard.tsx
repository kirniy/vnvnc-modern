import { motion, useReducedMotion } from 'framer-motion'
import type { SagaEventConfig } from '../../data/winterSaga'

interface SagaCardProps {
    event: SagaEventConfig
    onClick: (event: SagaEventConfig) => void
    index: number
    posterUrl?: string
}

const SagaCard = ({ event, onClick, index, posterUrl }: SagaCardProps) => {
    const isLarge = event.gridSpan === '2x2'
    const isWide = event.gridSpan === '2x1'
    const reduceMotion = useReducedMotion()

    const colSpan = isLarge ? 'lg:col-span-2' : isWide ? 'lg:col-span-2' : 'col-span-1'
    const rowSpan = isLarge ? 'lg:row-span-2' : 'row-span-1'

    // Stagger animation based on index
    const variants = reduceMotion
        ? undefined
        : {
            hidden: { opacity: 0, scale: 0.96, y: 14 },
            visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                    delay: Math.min(index * 0.08, 0.4),
                    type: 'tween' as const,
                    duration: 0.25,
                    ease: 'easeOut' as const
                }
            }
        }

    return (
        <motion.div
            variants={variants}
            initial={variants ? 'hidden' : false}
            animate={variants ? 'visible' : false}
            whileHover={reduceMotion ? undefined : { scale: 1.015, y: -4, transition: { duration: 0.2 } }}
            whileTap={reduceMotion ? undefined : { scale: 0.985, transition: { duration: 0.1 } }}
            className={`relative group cursor-pointer overflow-hidden rounded-3xl ${colSpan} ${rowSpan} min-h-[260px] lg:min-h-[340px] border border-white/10`}
            onClick={() => onClick(event)}
            style={{
                background: 'rgba(0, 0, 0, 0.6)',
                // Removed backdrop-blur - too heavy on mobile Safari
            }}
        >
            {/* Background Image / Poster */}
            {posterUrl && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={posterUrl}
                        alt=""
                        className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 40vw, 90vw"
                    />
                    {/* Gradient Overlay for Text Readability - Lighter for vibrant colors */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
            )}

            {/* Fallback pattern if no poster */}
            {!posterUrl && (
                <div
                    className="absolute inset-0 opacity-40 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-blue-900/20"
                    style={{ background: `radial-gradient(circle at center, ${event.accentColor}20, transparent 70%)` }}
                />
            )}


            {/* Content Container */}
            <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-between z-10">

                {/* Header: Date & Tag */}
                <div className="flex justify-between items-start">
                    <div className="bg-black/80 px-3 py-1 rounded-full border border-white/20 shadow-lg">
                        <span className="text-white font-display font-bold tracking-wider text-sm lg:text-base">
                            {event.date}
                        </span>
                    </div>
                </div>

                {/* Footer: Title, Tagline, Energy */}
                <div className="mt-auto">
                    {/* Unique Vibe Label (Replaces Energy Bars) */}
                    <div className="flex items-center gap-2 mb-1 opacity-90">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded bg-cyan-900/50 shadow-sm">
                            {event.vibeLabel || (event.energyLevel && event.energyLevel >= 4 ? 'HIGH VOLTAGE' : 'CHILL VIBES')}
                        </span>
                    </div>

                    <h3 className={`text-white font-display font-black text-[clamp(1.25rem,4vw,2.5rem)] uppercase leading-[1.05] mb-2 drop-shadow-xl break-words ${event.date.includes('31.12') ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 animate-shine' : ''}`}>
                        {event.title}
                    </h3>

                    {/* Main Hook as Description - HIDDEN ON MOBILE */}
                    <p className="hidden lg:block text-white/90 text-sm font-medium leading-snug line-clamp-3 mb-3 text-shadow-sm">
                        {event.hooks?.main || event.description}
                    </p>

                    {/* Tags List - Cleaned & Compact on Mobile */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-1 md:mt-0">
                        {event.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 md:px-2 rounded-md bg-black/50 border border-white/20 text-white">
                                {tag.replace(/[#_]/g, ' ')}
                            </span>
                        ))}
                    </div>
                </div>

            </div>

            {/* Dynamic Accent Border & Glow */}
            <div
                className="absolute inset-0 rounded-3xl border transition-all duration-300 pointer-events-none"
                style={{
                    borderColor: `${event.accentColor}40`,
                    boxShadow: `inset 0 0 20px ${event.accentColor}10`
                }}
            />
            {/* Raven Ball Special Effect */}
            {event.date.includes('31.12') && (
                <div className="absolute inset-0 rounded-3xl border border-white/30 animate-pulse pointer-events-none mix-blend-overlay" />
            )}

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shine pointer-events-none" />

        </motion.div>
    )
}

export default SagaCard
