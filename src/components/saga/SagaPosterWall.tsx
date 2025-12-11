import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ticketsCloudService } from '../../services/ticketsCloud'
import { useEffect, useMemo, useState } from 'react'

const SCROLL_DURATION = 120 // Seconds for a full loop
const SLIDE_DURATION = 8000 // ms for each poster in slideshow
const MAX_POSTERS_MOBILE = 8
const MAX_POSTERS_DESKTOP = 12
const DESKTOP_MIN_WIDTH = 1280

const SagaPosterWall = () => {
    const { data: events = [] } = useQuery({
        queryKey: ['events-posters'],
        queryFn: () => ticketsCloudService.getEvents(),
        staleTime: 1000 * 60 * 60 // 1 hour
    })

    const [viewport, setViewport] = useState({
        isMobileLike: false,
        prefersReducedMotion: false,
        saveData: false,
    })

    // Track viewport and user preferences to tone down motion on mobile
    useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const checkViewport = () => {
            const next = {
                isMobileLike: window.innerWidth < DESKTOP_MIN_WIDTH,
                prefersReducedMotion: motionQuery?.matches ?? false,
                saveData: Boolean((navigator as any)?.connection?.saveData),
            }

            setViewport((prev) => {
                if (
                    prev.isMobileLike === next.isMobileLike &&
                    prev.prefersReducedMotion === next.prefersReducedMotion &&
                    prev.saveData === next.saveData
                ) {
                    return prev
                }
                return next
            })
        }

        checkViewport()
        window.addEventListener('resize', checkViewport)
        if (motionQuery?.addEventListener) {
            motionQuery.addEventListener('change', checkViewport)
        } else if (motionQuery?.addListener) {
            motionQuery.addListener(checkViewport)
        }

        return () => {
            window.removeEventListener('resize', checkViewport)
            if (motionQuery?.removeEventListener) {
                motionQuery.removeEventListener('change', checkViewport)
            } else if (motionQuery?.removeListener) {
                motionQuery.removeListener(checkViewport)
            }
        }
    }, [])

    const posters = useMemo(() => {
        if (!events.length) return []

        const simplify = viewport.isMobileLike || viewport.prefersReducedMotion || viewport.saveData
        const limit = simplify ? MAX_POSTERS_MOBILE : MAX_POSTERS_DESKTOP

        // Filter events that have posters AND fall within the Saga range (Dec 26 - Jan 11)
        const validPosters = events
            .filter((e: any) => {
                if (!e.rawDate) return false
                const date = new Date(e.rawDate)
                const month = date.getMonth() // 0-indexed (11 = Dec, 0 = Jan)
                const day = date.getDate()

                // Dec 26-31 OR Jan 01-11
                const isDec = month === 11 && day >= 26
                const isJan = month === 0 && day <= 11

                return isDec || isJan
            })
            .map((e: any) => {
                const posterSmall = e.poster_small || e.poster // fallback if API provides poster
                const posterLarge = e.poster_original || posterSmall
                // Use smaller asset everywhere for the wall to save bandwidth/ram
                return posterSmall || posterLarge
            })
            .filter(Boolean) as string[]

        const unique = Array.from(new Set(validPosters))
        const shuffled = [...unique].sort(() => 0.5 - Math.random())
        return shuffled.slice(0, limit)
    }, [events, viewport])

    const postersForMarquee = useMemo(() => {
        if (!posters.length) return []
        // Duplicate for seamless loop but keep DOM weight low
        return [...posters, ...posters]
    }, [posters])

    if (posters.length === 0) return <div className="fixed inset-0 bg-stone-950" />

    const simplifyMotion = viewport.isMobileLike || viewport.prefersReducedMotion || viewport.saveData

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-stone-950 pointer-events-none">
            {/* Base Darkening Layer - Minimal opacity */}
            <div className="absolute inset-0 bg-black/40 z-10" />

            {/* Blue Winter Tint - Very subtle */}
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-20" />

            {/* Vignette - Only on edges */}
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black/80 z-30" />

            {/* Render Logic */}
            {simplifyMotion ? (
                <PosterSlideshow posters={posters} isLowMotion={viewport.prefersReducedMotion || viewport.saveData} />
            ) : (
                <PosterMarquee posters={postersForMarquee} reduceMotion={viewport.prefersReducedMotion} />
            )}

        </div>
    )
}

// Mobile: Single Poster with Ken Burns Effect
const PosterSlideshow = ({ posters, isLowMotion }: { posters: string[], isLowMotion: boolean }) => {
    const [index, setIndex] = useState(0)
    const slideDuration = isLowMotion ? SLIDE_DURATION * 1.5 : SLIDE_DURATION

    useEffect(() => {
        setIndex(0)
    }, [posters])

    useEffect(() => {
        if (!posters.length) return
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % posters.length)
        }, slideDuration)
        return () => clearInterval(timer)
    }, [posters.length, slideDuration])

    return (
        <div className="absolute inset-0 z-0 bg-black">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{
                        opacity: 0.6,
                        scale: 1,
                        x: isLowMotion ? 0 : [0, Math.random() * 14 - 7], // Subtle pan
                        y: isLowMotion ? 0 : [0, Math.random() * 14 - 7]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        opacity: { duration: 1.1 },
                        scale: { duration: slideDuration / 1000, ease: "linear" },
                        x: { duration: slideDuration / 1000, ease: "linear" },
                        y: { duration: slideDuration / 1000, ease: "linear" }
                    }}
                >
                    <img
                        src={posters[index]}
                        alt=""
                        className="w-full h-full object-cover grayscale-[0.3] contrast-110"
                        loading="lazy"
                        decoding="async"
                        sizes="100vw"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// Desktop: 2-Row Marquee (reduced from 3 for performance)
const PosterMarquee = ({ posters, reduceMotion }: { posters: string[], reduceMotion?: boolean }) => {
    return (
        <div className="absolute inset-0 z-0 flex flex-col justify-between opacity-70 grayscale-[0.3] contrast-110">
            <MarqueeRow posters={posters} direction={1} speed={SCROLL_DURATION} reduceMotion={reduceMotion} />
            <MarqueeRow posters={posters} direction={-1} speed={SCROLL_DURATION * 1.3} reduceMotion={reduceMotion} />
        </div>
    )
}

const MarqueeRow = ({ posters, direction, speed, reduceMotion }: { posters: string[], direction: number, speed: number, reduceMotion?: boolean }) => {
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
                    duration: reduceMotion ? speed * 1.2 : speed
                }}
                style={{ willChange: 'transform' }}
            >
                {posters.map((src, i) => (
                    <div key={i} className="relative aspect-[3/4] h-full flex-shrink-0 border-r border-black/50">
                        <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700"
                            loading="lazy"
                            decoding="async"
                            sizes="33vw"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

export default SagaPosterWall
