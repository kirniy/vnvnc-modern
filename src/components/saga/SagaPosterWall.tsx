import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ticketsCloudService } from '../../services/ticketsCloud'
import { useEffect, useState } from 'react'

const SCROLL_DURATION = 120 // Seconds for a full loop
const SLIDE_DURATION = 6000 // ms for each poster in slideshow

const SagaPosterWall = () => {
    const { data: events = [] } = useQuery({
        queryKey: ['events-posters'],
        queryFn: () => ticketsCloudService.getEvents(),
        staleTime: 1000 * 60 * 60 // 1 hour
    })

    const [posters, setPosters] = useState<string[]>([])
    const [isMobile, setIsMobile] = useState(false)

    // Check for mobile/low-power (simplified as screen width < 768px)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        if (events.length > 0) {
            // Filter events that have posters AND fall within the Saga range (Dec 26 - Jan 11)
            const validPosters = events
                .filter((e: any) => {
                    if (!e.poster_original || !e.rawDate) return false
                    const date = new Date(e.rawDate)
                    const month = date.getMonth() // 0-indexed (11 = Dec, 0 = Jan)
                    const day = date.getDate()

                    // Dec 26-31 OR Jan 01-11
                    const isDec = month === 11 && day >= 26
                    const isJan = month === 0 && day <= 11

                    return isDec || isJan
                })
                .map((e: any) => e.poster_original)

            // Shuffle
            const shuffled = [...validPosters].sort(() => 0.5 - Math.random())

            // For Marquee: Repeated for infinite scroll
            // For Slideshow: Just the shuffled list
            setPosters(shuffled)
        }
    }, [events])

    if (posters.length === 0) return <div className="fixed inset-0 bg-stone-950" />

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-stone-950 pointer-events-none">
            {/* Base Darkening Layer - Minimal opacity */}
            <div className="absolute inset-0 bg-black/40 z-10" />

            {/* Blue Winter Tint - Very subtle */}
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-20" />

            {/* Vignette - Only on edges */}
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black/80 z-30" />

            {/* Render Logic */}
            {isMobile ? (
                <PosterSlideshow posters={posters} />
            ) : (
                <PosterMarquee posters={[...posters, ...posters, ...posters, ...posters]} />
            )}

            {/* Frost Overlay Texture - optional, using noise or gradient */}
            <div className="absolute inset-0 z-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-200 pointer-events-none" />
        </div>
    )
}

// Mobile: Single Poster with Ken Burns Effect
const PosterSlideshow = ({ posters }: { posters: string[] }) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % posters.length)
        }, SLIDE_DURATION)
        return () => clearInterval(timer)
    }, [posters.length])

    return (
        <div className="absolute inset-0 z-0 bg-black">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{
                        opacity: 0.6,
                        scale: 1,
                        x: [0, Math.random() * 20 - 10], // Subtle pan
                        y: [0, Math.random() * 20 - 10]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        opacity: { duration: 1.5 },
                        scale: { duration: SLIDE_DURATION / 1000, ease: "linear" },
                        x: { duration: SLIDE_DURATION / 1000, ease: "linear" },
                        y: { duration: SLIDE_DURATION / 1000, ease: "linear" }
                    }}
                >
                    <img
                        src={posters[index]}
                        alt=""
                        className="w-full h-full object-cover grayscale-[0.3] contrast-110"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// Desktop: Full 3-Row Marquee
const PosterMarquee = ({ posters }: { posters: string[] }) => {
    return (
        <div className="absolute inset-0 z-0 flex flex-col justify-between opacity-80 grayscale-[0.3] contrast-110">
            <MarqueeRow posters={posters} direction={1} speed={SCROLL_DURATION} />
            <MarqueeRow posters={posters} direction={-1} speed={SCROLL_DURATION * 1.5} />
            <MarqueeRow posters={posters} direction={1} speed={SCROLL_DURATION * 1.2} />
        </div>
    )
}

const MarqueeRow = ({ posters, direction, speed }: { posters: string[], direction: number, speed: number }) => {
    return (
        <div className="flex-1 flex overflow-hidden relative">
            <motion.div
                className="flex gap-0 min-w-full"
                animate={{
                    x: direction > 0 ? ['0%', '-50%'] : ['-50%', '0%']
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed
                }}
                style={{ willChange: 'transform' }}
            >
                {posters.map((src, i) => (
                    <div key={i} className="relative aspect-[3/4] h-full flex-shrink-0 border-r border-black/50">
                        <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700"
                            loading="eager"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

export default SagaPosterWall
