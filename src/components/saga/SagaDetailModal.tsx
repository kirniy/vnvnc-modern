
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ticket, Music, Shirt, Star, Users, Flame, Maximize2 } from 'lucide-react'
import type { SagaEventConfig } from '../../data/winterSaga'
import { useQuery } from '@tanstack/react-query'
import { ticketsCloudService } from '../../services/ticketsCloud'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import {
    Snowflake, Wind, Map, Compass, Mountain,
    Crown, Key, Feather, Eye, Wine,
    Moon, Coffee, BedDouble, Home, Sunrise,
    Smartphone, Camera, Headphones, Heart,
    Gift, Trees, Ghost, Skull, PartyPopper,
    Zap, Mic, Speaker, Radio,
    Sparkles, Scroll, FlaskConical, GraduationCap,
    Disc3, Martini, Play, Glasses,
    Trash2, Beer, Frown, AlertTriangle
} from 'lucide-react'

// Helper to resolve icon name to component
const getIconByName = (name: string) => {
    const icons: Record<string, any> = {
        Snowflake, Wind, Map, Compass, Mountain,
        Crown, Key, Feather, Eye, Wine,
        Moon, Coffee, BedDouble, Home, Sunrise,
        Smartphone, Camera, Headphones, Flame, Heart,
        Gift, Trees, Ghost, Skull, PartyPopper,
        Zap, Music, Mic, Speaker, Radio,
        Sparkles, Scroll, FlaskConical, GraduationCap,
        Disc3, Martini, Play, Glasses,
        Trash2, Beer, Frown, AlertTriangle
    }
    return icons[name] || Star
}

interface SagaDetailModalProps {
    event: SagaEventConfig
    onClose: () => void
}

// Cycling Text Component with AnimatePresence
const CyclingText = ({ texts }: { texts: string[] }) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (texts.length <= 1) return
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % texts.length)
        }, 3000) // Cycle every 3 seconds
        return () => clearInterval(timer)
    }, [texts.length])

    return (
        <div className="relative w-full h-full flex items-center">
            <AnimatePresence mode="wait">
                <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm text-gray-300 leading-snug absolute w-full"
                >
                    {texts[index]}
                </motion.p>
            </AnimatePresence>
        </div>
    )
}

const SagaDetailModal = ({ event, onClose }: SagaDetailModalProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const { data: tcEvents = [] } = useQuery({
        queryKey: ['events'],
        queryFn: () => ticketsCloudService.getEvents(),
        staleTime: 1000 * 60 * 5
    })

    // Helper: Verify if a specific date string (DD.MM) is "expired" (past 8AM next day)
    const isDateExpired = (dateStr: string) => {
        const [day, month] = dateStr.trim().split('.').map(Number)

        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1 // 1-12

        // Define Season Start Year dynamically
        // If we are late in the year (Sept-Dec), season starts this year.
        // If we are early in the year (Jan-June), season started last year.
        const seasonStartYear = currentMonth >= 9 ? currentYear : currentYear - 1

        // If event month is 12, it's in the start year. If 01, it's start year + 1.
        const eventYear = month === 12 ? seasonStartYear : seasonStartYear + 1

        // Expiry: 8:00 AM on the day AFTER the event
        const expiryDate = new Date(eventYear, month - 1, day + 1, 8, 0, 0)

        return now > expiryDate
    }

    // Determine default date: First non-expired date, or the last one if all expired
    const getInitialDate = () => {
        if (!event.twinEventDates) return event.date

        // Find first date that is NOT expired
        const activeDate = event.twinEventDates.find(d => !isDateExpired(d.date))
        return activeDate ? activeDate.date : event.twinEventDates[event.twinEventDates.length - 1].date
    }

    // Helper to force re-render logic when event changes or cycling resets
    const [selectedDate, setSelectedDate] = useState<string>(getInitialDate())

    // Reset date when event changes
    useEffect(() => {
        setSelectedDate(getInitialDate())
    }, [event.id])

    // Find the specific TC event matching the selected date
    const matchedTcEvent = useMemo(() => {
        if (!tcEvents.length) return null

        // If it's a twin event, match by specific date "DD.MM"
        const targetDateStr = event.twinEventDates ? selectedDate : event.date.split('-')[0] // handle "26-27.12" range by taking first part or logic? 
        // Actually, single events store date as "31.12". Twin are "26-27.12" but we use the selector.

        // Let's parse the target date string into Day/Month
        const [targetDay, targetMonth] = targetDateStr.trim().split('.').map(Number)

        return tcEvents.find((tcEvent: any) => {
            if (!tcEvent.rawDate) return false
            const date = new Date(tcEvent.rawDate)
            // Month in JS is 0-indexed!!
            return date.getDate() === targetDay && date.getMonth() === (targetMonth - 1)
        })
    }, [tcEvents, selectedDate, event])


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
                layoutId={`card-${event.date}`}
                className="relative w-full max-w-4xl bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                style={{
                    boxShadow: `0 0 50px ${event.accentColor}30`
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                    <X size={20} />
                </button>

                {/* Left Side: Poster / Visual - Optimized for 3:4 */}
                <div
                    className="w-full md:w-2/5 relative min-h-[300px] md:min-h-full bg-black overflow-hidden group cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                >
                    {matchedTcEvent?.poster_original ? (
                        <>
                            {/* Blurred Background for Fill */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110"
                                style={{ backgroundImage: `url(${matchedTcEvent.poster_original})` }}
                            />

                            {/* Main Image - Contain/Cover hybrid to respect 3:4 */}
                            <motion.img
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={matchedTcEvent.poster_original}
                                alt={event.title}
                                className="absolute inset-0 w-full h-full object-contain md:object-cover md:object-center z-10 p-4 md:p-0 transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Zoom Hint - Moved to Left to avoid Close Button overlap on Mobile */}
                            <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-full text-white">
                                <Maximize2 size={20} />
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20 bg-gradient-to-br from-gray-900 to-black">
                            <Ticket size={48} />
                        </div>
                    )}

                    {/* Mobile Title Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 md:hidden z-20">
                        <h2 className="text-3xl font-display font-bold text-white mb-2">{event.title}</h2>
                        <p className="text-cyan-300 font-mono tracking-widest">{selectedDate}</p>
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-black/5">

                    {/* Header (Desktop) */}
                    <div className="hidden md:block mb-8">
                        <div className="flex items-baseline gap-4 mb-2">
                            <h2 className="text-4xl lg:text-5xl font-display font-black text-white uppercase tracking-tight leading-none">
                                {event.title}
                            </h2>
                        </div>
                        <p className="text-2xl text-white/60 font-light">{event.subtitle}</p>
                    </div>

                    {/* Twin Event Selector */}
                    {event.twinEventDates && (
                        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
                            {event.twinEventDates.map((twin) => {
                                const expired = isDateExpired(twin.date)
                                return (
                                    <button
                                        key={twin.date}
                                        onClick={() => setSelectedDate(twin.date)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedDate === twin.date
                                            ? 'bg-white text-black shadow-lg'
                                            : expired
                                                ? 'text-white/20 hover:text-white/40 bg-transparent' // Expired styling
                                                : 'text-white/60 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {twin.date}
                                        {twin.titleSuffix && <span className="ml-2 opacity-60 font-normal">{twin.titleSuffix}</span>}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Hooks / Description - Prevent cutting */}
                    <div className="space-y-6 mb-8">
                        <div className="border-l-2 border-cyan-500/50 pl-4 py-1">
                            <p className="text-lg md:text-xl text-white font-medium italic leading-relaxed break-words">
                                {event.hooks?.main || event.description}
                            </p>
                        </div>

                        {event.hooks?.story && (
                            <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
                                {event.hooks.story}
                            </p>
                        )}
                    </div>

                    {/* Stats / Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Energy / Vibe Icons - ENLARGED */}
                        <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-1 justify-center">
                            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-widest">
                                <Flame size={14} /> СИМВОЛЫ
                            </div>
                            <div className="flex gap-2.5 mt-2">
                                {event.vibeIcons ? (
                                    event.vibeIcons.map((iconName, i) => {
                                        const IconComponent = getIconByName(iconName)
                                        return (
                                            <div key={i} className="" title={iconName}>
                                                <IconComponent
                                                    size={26} // Increased size from 22 to 26
                                                    className="transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                                    style={{ color: event.accentColor }}
                                                />
                                            </div>
                                        )
                                    })
                                ) : (
                                    // Fallback to stars if no vibeIcons defined
                                    [1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={22}
                                            className={star <= (event.energyLevel || 3) ? "text-cyan-400 fill-cyan-400" : "text-white/10"}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Audience - CYCLING TEXT */}
                        <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-1 col-span-2 sm:col-span-1 relative overflow-hidden">
                            {/* Renamed Header */}
                            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-widest z-10">
                                <Users size={14} /> ДЛЯ КОГО
                            </div>

                            {/* Cycling Text Component */}
                            <div className="h-[40px] relative z-10 flex items-center">
                                <CyclingText texts={Array.isArray(event.audience?.perfectFor) ? event.audience!.perfectFor : [event.audience?.perfectFor || '']} />
                            </div>
                        </div>
                    </div>

                    {/* Details List */}
                    <div className="space-y-4 mb-8">
                        {/* Visual */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-cyan-400">
                                <Music size={16} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Визуал & Атмосфера</h4>
                                <p className="text-white/60 text-sm">{event.visualTheme}</p>
                            </div>
                        </div>

                        {/* Dress Code */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0" style={{ color: event.accentColor }}>
                                <Shirt size={16} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Дресс-код</h4>
                                <p className="text-white/60 text-sm">{event.dressCode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Button - Official Widget Implementation */}
                    <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href="#"
                        className={`ticketscloud-widget w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg uppercase transition-all ${matchedTcEvent
                            ? 'bg-white text-black hover:bg-cyan-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                            }`}
                        data-tc-event={matchedTcEvent?.id}
                        data-tc-token={import.meta.env.VITE_TC_WIDGET_TOKEN}
                    >
                        <Ticket size={20} />
                        {matchedTcEvent ? 'Купить Билет' : 'Скоро в продаже'}
                    </motion.a>

                    {event.hooks?.alternate && (
                        <p className="text-center text-sm text-white/60 mt-6 italic max-w-md mx-auto leading-relaxed">
                            "{event.hooks.alternate}"
                        </p>
                    )}

                </div>
            </motion.div>

            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={matchedTcEvent?.poster_original ? [{ src: matchedTcEvent.poster_original }] : []}
                styles={{ container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' } }}
            />
        </div>
    )
}

export default SagaDetailModal
