import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../../services/ticketsCloud'
import { useEffect, useMemo, useState } from 'react'

const WALL_MIN_WIDTH = 1600
const SLIDE_DURATION = 12000 // 12s per slide (slower = less CPU)
const MAX_POSTERS = 3 // Limit loaded images to reduce memory

const SagaPosterWall = () => {
    const { data: events = [] } = useQuery({
        queryKey: ['events-posters'],
        queryFn: () => ticketsCloudService.getEvents(),
        staleTime: 1000 * 60 * 60 // 1 hour
    })

    const [viewport, setViewport] = useState({
        isMobileLike: false, // For image resolution text
        isMobile: false,     // For simplified animation
        prefersReducedMotion: false
    })

    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const checkViewport = () => {
            const width = window.innerWidth
            setViewport({
                isMobileLike: width < WALL_MIN_WIDTH,
                isMobile: width < 1024, // Tablet/Mobile cutoff
                prefersReducedMotion: motionQuery?.matches ?? false
            })
        }
        checkViewport()
        window.addEventListener('resize', checkViewport)
        return () => window.removeEventListener('resize', checkViewport)
    }, [])

    // Prepare valid posters list
    const posterUrls = useMemo(() => {
        if (!events.length) return []

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 1. Filter relevant upcoming events (Dec 26 - Jan 11)
        const validEvents = events.filter((e: any) => {
            if (!e.rawDate) return false
            const date = new Date(e.rawDate)
            if (date < today) return false
            const month = date.getMonth()
            const day = date.getDate()
            const isDec = month === 11 && day >= 26
            const isJan = month === 0 && day <= 11
            return isDec || isJan
        })

        // 2. Extract best URLs
        const urls = validEvents
            .map((e: any) => viewport.isMobileLike
                ? (e.poster_small || e.poster || e.poster_original)
                : (e.poster_original || e.poster || e.poster_small)
            )
            .filter(Boolean) as string[]

        // 3. Deduplicate and limit to reduce memory
        return Array.from(new Set(urls)).slice(0, MAX_POSTERS)
    }, [events, viewport.isMobileLike])

    // Cycle slides
    useEffect(() => {
        if (posterUrls.length <= 1) return
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % posterUrls.length)
        }, SLIDE_DURATION)
        return () => clearInterval(interval)
    }, [posterUrls.length])

    if (!posterUrls.length) return <div className="fixed inset-0 bg-stone-950" />

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#050b14] pointer-events-none">

            {/* Poster Slide Layer */}
            {posterUrls.map((url, index) => {
                const isActive = index === currentIndex

                // MOBILE: Simple, lightweight version
                if (viewport.isMobile) {
                    return (
                        <div
                            key={url}
                            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover"
                                style={{ filter: 'saturate(0.8) contrast(1.1) brightness(0.7)' }}
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                        </div>
                    )
                }

                // DESKTOP: Full Cinematic Dual-Layer
                return (
                    <div
                        key={url}
                        className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {/* 1. Ambient Background Layer (Blurred Colors) */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img
                                src={url}
                                alt=""
                                className={`w-full h-full object-cover blur-[80px] scale-125 opacity-60 mix-blend-screen transition-transform duration-[20s] ease-linear ${isActive ? 'scale-150' : 'scale-125'}`}
                            />
                        </div>

                        {/* 2. Sharp Foreground Layer (Slow Zoom) */}
                        <img
                            src={url}
                            alt=""
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-out will-change-transform ${isActive ? 'scale-110' : 'scale-100'}`}
                            style={{
                                // Filter: Cinematic Winter Grade
                                filter: 'saturate(0.9) contrast(1.15) brightness(0.75)'
                            }}
                            loading={index === 0 ? 'eager' : 'lazy'}
                        />
                    </div>
                )
            })}

            {/* Winter Color Grade Overlays - Applied over the final composite */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/40 via-transparent to-blue-950/60 mix-blend-soft-light" />
            <div className="absolute inset-0 bg-[#08182b]/30 mix-blend-color" /> {/* Harmonize colors to Blue/Cyan */}

            {/* Clean Vignette - Focuses center */}
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/10 to-black/90 scale-110" />

            {/* Grain Texture (Static, efficient) */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        </div>
    )
}

export default SagaPosterWall
