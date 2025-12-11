import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../../services/ticketsCloud'
import { useEffect, useMemo, useState } from 'react'

const WALL_MIN_WIDTH = 1600

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
        width: 0,
    })

    // Track viewport and user preferences to tone down motion on mobile
    useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const checkViewport = () => {
            const next = {
                width: window.innerWidth,
                isMobileLike: window.innerWidth < WALL_MIN_WIDTH,
                prefersReducedMotion: motionQuery?.matches ?? false,
                saveData: Boolean((navigator as any)?.connection?.saveData),
            }

            setViewport((prev) => {
                if (
                    prev.isMobileLike === next.isMobileLike &&
                    prev.prefersReducedMotion === next.prefersReducedMotion &&
                    prev.saveData === next.saveData &&
                    prev.width === next.width
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

    const heroSources = useMemo(() => {
        if (!events.length) return null

        const validPosters = events
            .filter((e: any) => {
                if (!e.rawDate) return false
                const date = new Date(e.rawDate)
                const month = date.getMonth() // 0-indexed (11 = Dec, 0 = Jan)
                const day = date.getDate()
                const isDec = month === 11 && day >= 26
                const isJan = month === 0 && day <= 11
                return isDec || isJan
            })
            .map((e: any) => ({
                small: e.poster_small || e.poster || e.poster_original,
                large: e.poster_original || e.poster_small || e.poster,
            }))
            .filter(p => p.small || p.large)

        if (!validPosters.length) return null
        // Pick a deterministic first poster for stability (avoid random repaint)
        return validPosters[0]
    }, [events])

    const heroSrc = useMemo(() => {
        if (!heroSources) return ''
        return viewport.isMobileLike ? (heroSources.small || heroSources.large || '') : (heroSources.large || heroSources.small || '')
    }, [heroSources, viewport.isMobileLike])

    if (!heroSrc) return <div className="fixed inset-0 bg-stone-950" />

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-stone-950 pointer-events-none">
            {/* Base image, blurred to hide compression and keep it soft */}
            <div className="absolute inset-0">
                <img
                    src={heroSrc}
                    alt=""
                    className="w-full h-full object-cover scale-[1.04] blur-sm lg:blur-[2px] opacity-70 saturate-125 contrast-110"
                    loading="lazy"
                    decoding="async"
                    sizes="100vw"
                />
            </div>

            {/* Soft color wash */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/25 via-black/50 to-purple-900/25 mix-blend-screen" />

            {/* Darken edges for readability */}
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/35 to-black/70" />
        </div>
    )
}

export default SagaPosterWall
