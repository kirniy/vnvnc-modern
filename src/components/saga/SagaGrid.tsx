import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { WINTER_SAGA_DATA, type SagaEventConfig } from '../../data/winterSaga'
import SagaCard from './SagaCard'
import SagaDetailModal from './SagaDetailModal'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../../services/ticketsCloud'
import FrostedTitle from './FrostedTitle'

const SagaGrid = () => {
    const [selectedEvent, setSelectedEvent] = useState<SagaEventConfig | null>(null)
    const [isMobileLike, setIsMobileLike] = useState(false)

    const { data: tcEvents = [] } = useQuery({
        queryKey: ['events'],
        queryFn: () => ticketsCloudService.getEvents(),
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false // Prevent list flicker on mobile scroll/tab switch
    })

    useEffect(() => {
        let lastWidth = window.innerWidth
        const checkMobile = () => {
            const width = window.innerWidth
            // Only update if crossing the breakpoint (prevents resize on mobile install/scroll)
            if ((lastWidth >= 1280 && width < 1280) || (lastWidth < 1280 && width >= 1280)) {
                setIsMobileLike(width < 1280)
            }
            lastWidth = width
        }
        // Set initial
        setIsMobileLike(window.innerWidth < 1280)

        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const posterByDate = useMemo(() => {
        const posterMap = new Map<string, string>()

        tcEvents.forEach((e: any) => {
            if (!e.rawDate) return
            const d = new Date(e.rawDate)
            // Use Moscow timezone to extract day/month (events are in Moscow time)
            const mskDay = d.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'Europe/Moscow' })
            const mskMonth = d.toLocaleDateString('en-GB', { month: '2-digit', timeZone: 'Europe/Moscow' })
            const key = `${mskDay}.${mskMonth}`
            const posterSmall = e.poster_small || e.poster // fallback for API variance
            const posterSrc = posterSmall || e.poster_original // always prefer small to save memory

            if (posterSrc && !posterMap.has(key)) {
                posterMap.set(key, posterSrc)
            }
        })

        return posterMap
    }, [tcEvents, isMobileLike])

    const getPosterForEvent = useCallback((sagaEvent: SagaEventConfig) => {
        // Find matching TC event by date (simple match for now)
        // Saga dates are "26-27.12", "31.12". TC rawDate is full ISO.
        const targetDatePart = sagaEvent.twinEventDates
            ? sagaEvent.twinEventDates[0].date // use first date for cover
            : sagaEvent.date.split('-')[0] // handle "26-27.12"

        const [day, month] = targetDatePart.trim().split('.').map(Number)

        const key = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`
        return posterByDate.get(key)
    }, [posterByDate])

    // Helper: Check if an event has fully expired (all dates passed 8AM cutoff)
    const isEventExpired = useCallback((sagaEvent: SagaEventConfig) => {
        // Get current time in Moscow timezone
        const nowMsk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
        const currentYear = nowMsk.getFullYear()
        const currentMonth = nowMsk.getMonth() + 1

        // Determine season year (Dec belongs to current year, Jan belongs to next year of the season)
        const seasonStartYear = currentMonth >= 9 ? currentYear : currentYear - 1

        // Get the LAST date of the event
        let lastDateStr: string
        if (sagaEvent.twinEventDates && sagaEvent.twinEventDates.length > 0) {
            // Use the last date from twinEventDates
            lastDateStr = sagaEvent.twinEventDates[sagaEvent.twinEventDates.length - 1].date
        } else if (sagaEvent.date.includes('-')) {
            // Handle range like "26-27.12" - extract the second part
            const parts = sagaEvent.date.split('-')
            const lastPart = parts[parts.length - 1] // "27.12"
            lastDateStr = lastPart
        } else {
            // Single date like "31.12"
            lastDateStr = sagaEvent.date
        }

        // Parse the date
        const [day, month] = lastDateStr.trim().split('.').map(Number)
        const eventYear = month === 12 ? seasonStartYear : seasonStartYear + 1

        // Event expires at 8 AM on the day AFTER the event
        const expiryDate = new Date(eventYear, month - 1, day + 1, 8, 0, 0)
        return nowMsk > expiryDate
    }, [])

    // Filter events: Only show if poster exists AND event hasn't fully expired
    const visibleEvents = useMemo(
        () => WINTER_SAGA_DATA.filter(event => getPosterForEvent(event) && !isEventExpired(event)),
        [getPosterForEvent, isEventExpired]
    )

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <FrostedTitle />

            {/* The Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
                {visibleEvents.map((event, index) => {
                    const posterUrl = getPosterForEvent(event)
                    return (
                        <SagaCard
                            key={index}
                            event={event}
                            onClick={setSelectedEvent}
                            index={index}
                            posterUrl={posterUrl}
                        />
                    )
                })}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <SagaDetailModal
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default SagaGrid
