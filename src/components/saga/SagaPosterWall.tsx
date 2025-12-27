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

        // Get today's date in Moscow timezone
        const nowMsk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
        nowMsk.setHours(0, 0, 0, 0)

        // 1. Filter relevant upcoming events (Dec 26 - Jan 11) in Moscow time
        const validEvents = events.filter((e: any) => {
            if (!e.rawDate) return false
            const date = new Date(e.rawDate)
            // Convert to Moscow timezone for comparison
            const mskDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
            if (mskDate < nowMsk) return false
            const month = mskDate.getMonth()
            const day = mskDate.getDate()
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
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#050b14] pointer-events-none blur-preserve">

            {/* Poster Slide Layer - Simple Crossfade (Lightweight) */}
            {posterUrls.map((url, index) => {
                const isActive = index === currentIndex
                return (
                    <div
                        key={url}
                        className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{
                                // Filter: Desaturate slightly + boost contrast + cool hue rotation
                                // No scale transform - purely static background
                                filter: 'saturate(0.8) contrast(1.1) brightness(0.7)'
                            }}
                            loading={index === 0 ? 'eager' : 'lazy'}
                        />
                    </div>
                )
            })}

            {/* Winter Color Grade: Unifies disparate posters into the Blue/Cyan theme */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/60 via-slate-900/40 to-indigo-950/60 mix-blend-hard-light" />
            <div className="absolute inset-0 bg-blue-900/20 mix-blend-color" /> {/* Forces Cool Tone */}

            {/* Vignette & Fade Out Bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/60" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/80" />

        </div>
    )
}

export default SagaPosterWall
