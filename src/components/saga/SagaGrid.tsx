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
        staleTime: 1000 * 60 * 60
    })

    useEffect(() => {
        const checkMobile = () => setIsMobileLike(window.innerWidth < 1280) // treat medium as mobile
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const posterByDate = useMemo(() => {
        const posterMap = new Map<string, string>()

        tcEvents.forEach((e: any) => {
            if (!e.rawDate) return
            const d = new Date(e.rawDate)
            const key = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
            const posterSmall = e.poster_small || e.poster // fallback for API variance
            const posterSrc = isMobileLike
                ? (posterSmall || e.poster_original)
                : (e.poster_original || posterSmall)

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

    const visibleEvents = useMemo(
        () => WINTER_SAGA_DATA.filter(event => getPosterForEvent(event)),
        [getPosterForEvent]
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
