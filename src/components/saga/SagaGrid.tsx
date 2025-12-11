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

    // Filter out expired events (8:00 AM Moscow next day)
    const activeEvents = useMemo(() => {
        const now = new Date()
        const nowMoscow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))

        return WINTER_SAGA_DATA.filter(event => {
            // Determine the "last" date of the event
            let targetDateStr = event.date.split('-')[1] || event.date.split('-')[0] // "26-27.12" -> "27.12"
            // Handle twinEventDates explicitly if present
            if (event.twinEventDates && event.twinEventDates.length > 0) {
                targetDateStr = event.twinEventDates[event.twinEventDates.length - 1].date
            }

            // Allow cleaning up the string "01-02.01" -> "02.01" logic above handles it via split('-')[1]
            // "31.12" -> "31.12"

            // Parse DD.MM
            const [day, month] = targetDateStr.trim().split('.').map(Number)

            // Construct expiration date (Next Year for Jan, Current Year for Dec)
            // ASSUMPTION: '12' is Dec 2024, '01' is Jan 2025.
            const year = month === 12 ? 2024 : 2025

            const expiryDate = new Date(Date.UTC(year, month - 1, day))
            // Add 1 day + 8 hours (32 hours from start of day?) No, 8AM next day.
            // Set to "Next Day" at 08:00
            expiryDate.setDate(expiryDate.getDate() + 1)
            expiryDate.setHours(8, 0, 0, 0)

            // Adjust to Moscow Time comparison?
            // Actually, simply: compare nowMoscow with expiryDate (treated as Moscow time)
            // We can just construct the expiry in local time "as if" it's Moscow, then compare values.

            // Let's rely on simple timestamp comp if we treat everything as Moscow.
            // nowMoscow is a Date object representing the time in Moscow. 
            // We need to create an expiry Date object that represents 8AM on the day after the event IN MOSCOW.

            const expiryMoscow = new Date(year, month - 1, day + 1, 8, 0, 0)

            // If currently active (now < expiry), keep it.
            // Note: date construction above uses local browser time for "new Date(y,m,d)", which is wrong if we compare to "nowMoscow" which is shifted.
            // Better approach:

            // 1. Get current absolute timestamp.
            // 2. Determine "Absolute Timestamp of 8AM Moscow Time on Day After Event".

            // Simplified:
            // Just use string comparison or manually adjust hours.

            return nowMoscow < expiryMoscow
        })
    }, [])

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
