import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { WINTER_SAGA_DATA, type SagaEventConfig } from '../../data/winterSaga'
import SagaCard from './SagaCard'
import SagaDetailModal from './SagaDetailModal'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../../services/ticketsCloud'
import FrostedTitle from './FrostedTitle'

const SagaGrid = () => {
    const [selectedEvent, setSelectedEvent] = useState<SagaEventConfig | null>(null)

    const { data: tcEvents = [] } = useQuery({
        queryKey: ['events'],
        queryFn: () => ticketsCloudService.getEvents(),
        staleTime: 1000 * 60 * 60
    })



    const getPosterForEvent = (sagaEvent: SagaEventConfig) => {
        // Find matching TC event by date (simple match for now)
        // Saga dates are "26-27.12", "31.12". TC rawDate is full ISO.
        const targetDatePart = sagaEvent.twinEventDates
            ? sagaEvent.twinEventDates[0].date // use first date for cover
            : sagaEvent.date.split('-')[0] // handle "26-27.12"

        const [day, month] = targetDatePart.trim().split('.').map(Number)

        const match = tcEvents.find((e: any) => {
            if (!e.rawDate) return false
            const d = new Date(e.rawDate)
            return d.getDate() === day && d.getMonth() === (month - 1)
        })
        return match?.poster_original
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <FrostedTitle />

            {/* The Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
                {WINTER_SAGA_DATA.filter(event => getPosterForEvent(event)).map((event, index) => (
                    <SagaCard
                        key={index}
                        event={event}
                        onClick={setSelectedEvent}
                        index={index}
                        posterUrl={getPosterForEvent(event)}
                    />
                ))}
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
