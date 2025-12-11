
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


    // Toggle body class for nav hiding
    useEffect(() => {
        document.body.classList.add('modal-open-hide-nav')
        return () => {
            document.body.classList.remove('modal-open-hide-nav')
        }
    }, [])

    return (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
                layoutId={`card-${event.date}`}
                className="relative w-full max-w-5xl bg-zinc-900 border-t md:border border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[100dvh] md:h-[85vh] mt-0 md:mt-0"
                style={{
                    boxShadow: `0 0 50px ${event.accentColor}30`
                }}
            >
                {/* Close Button - Desktop */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full hover:bg-white/20 transition-colors text-white hidden md:block"
                >
                    <X size={20} />
                </button>

                {/* Mobile Drag/Close Handle */}
                <div className="md:hidden absolute top-0 inset-x-0 h-6 z-50 flex justify-center items-center pointer-events-none">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mt-2" />
                </div>
                <button
                    onClick={onClose}
                    className="md:hidden absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur rounded-full text-white"
                >
                    <X size={20} />
                </button>


                {/* Left Side: Poster / Visual */}
                <div
                    className="w-full md:w-5/12 relative h-[35vh] md:h-full bg-black overflow-hidden group cursor-zoom-in shrink-0"
                    onClick={() => setLightboxOpen(true)}
                >
                    {matchedTcEvent?.poster_original ? (
                        <>
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110"
                                style={{ backgroundImage: `url(${matchedTcEvent.poster_original})` }}
                            />

                            <motion.img
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={matchedTcEvent.poster_original}
                                alt={event.title}
                                className="absolute inset-0 w-full h-full object-contain md:object-cover md:object-center z-10 transition-transform duration-500 group-hover:scale-105"
                            />

                            <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-full text-white">
                                <Maximize2 size={20} />
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20 bg-gradient-to-br from-gray-900 to-black">
                            <Ticket size={48} />
                        </div>
                    )}

                    {/* Mobile Title Overlay - Gradient */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent pt-12 pb-4 px-6 md:hidden z-20">
                        <h2 className="text-2xl font-display font-bold text-white leading-none shadow-black drop-shadow-lg">{event.title}</h2>
                        <p className="text-cyan-300 font-mono text-sm tracking-widest mt-1 opacity-90">{selectedDate}</p>
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-7/12 flex flex-col flex-1 md:h-full bg-zinc-900 relative min-h-0 overflow-hidden">

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 pb-32"> {/* Increased bottom padding */}

                        {/* Desktop Header */}
                        <div className="hidden md:block mb-6">
                            <h2 className="text-4xl lg:text-5xl font-display font-black text-white uppercase tracking-tight leading-none mb-2">
                                {event.title}
                            </h2>
                            <p className="text-xl text-white/60 font-light">{event.subtitle}</p>
                        </div>

                        {/* Twin Event Selector - STICKY & ENHANCED for Mobile */}
                        {event.twinEventDates && (
                            <div className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-sm py-3 -mx-2 px-2 md:-mx-0 md:px-0 mb-6 border-b border-white/5 md:border-none shadow-xl md:shadow-none">
                                <div className="flex w-full bg-white/5 rounded-xl p-1 gap-1">
                                    {event.twinEventDates.map((twin) => {
                                        const expired = isDateExpired(twin.date)
                                        return (
                                            <button
                                                key={twin.date}
                                                onClick={() => setSelectedDate(twin.date)}
                                                className={`flex-1 py-3 md:py-2 rounded-lg text-base md:text-sm font-bold uppercase tracking-widest transition-all ${selectedDate === twin.date
                                                    ? 'bg-white text-black shadow-lg scale-[1.02]'
                                                    : expired
                                                        ? 'text-white/20 cursor-not-allowed'
                                                        : 'text-white/40 hover:text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                {twin.date}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-4 mb-6 md:mb-8">
                            <div className="border-l-2 border-cyan-500/50 pl-4 py-1">
                                <p className="text-base md:text-lg text-white font-medium italic leading-relaxed break-words">
                                    {event.hooks?.main || event.description}
                                </p>
                            </div>
                            {event.hooks?.story && (
                                <p className="text-gray-400 font-light leading-relaxed text-sm">
                                    {event.hooks.story}
                                </p>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                            {/* Icons - Flex Wrap Fix */}
                            <div className="bg-white/5 rounded-xl p-3 md:p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-widest">
                                    <Flame size={12} /> СИМВОЛЫ
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {event.vibeIcons ? (
                                        event.vibeIcons.map((iconName, i) => {
                                            const IconComponent = getIconByName(iconName)
                                            return (
                                                <IconComponent
                                                    key={i}
                                                    size={22}
                                                    className="text-white/90"
                                                    style={{ color: event.accentColor }}
                                                />
                                            )
                                        })
                                    ) : (
                                        <Star size={20} className="text-cyan-400" />
                                    )}
                                </div>
                            </div>

                            {/* Audience */}
                            <div className="bg-white/5 rounded-xl p-3 md:p-4 flex flex-col gap-2 relative overflow-hidden">
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-widest z-10">
                                    <Users size={12} /> ДЛЯ КОГО
                                </div>
                                <div className="h-[30px] relative z-10 flex items-center">
                                    <CyclingText texts={Array.isArray(event.audience?.perfectFor) ? event.audience!.perfectFor : [event.audience?.perfectFor || '']} />
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 mb-8">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-cyan-400">
                                    <Music size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs md:text-sm font-bold text-white">Визуал & Атмосфера</h4>
                                    <p className="text-white/60 text-xs md:text-sm leading-snug">{event.visualTheme}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0" style={{ color: event.accentColor }}>
                                    <Shirt size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs md:text-sm font-bold text-white">Дресс-код</h4>
                                    <p className="text-white/60 text-xs md:text-sm leading-snug">{event.dressCode}</p>
                                </div>
                            </div>
                        </div>

                        {event.hooks?.alternate && (
                            <p className="text-center text-xs text-white/50 italic mb-4">
                                "{event.hooks.alternate}"
                            </p>
                        )}
                    </div>

                    {/* Fixed/Sticky Action Bar - Fixed to Viewport on Mobile - LIFTED UP */}
                    <div className="fixed md:absolute bottom-4 md:bottom-0 left-0 right-0 px-4 md:p-6 pb-safe md:pb-6 z-[210] md:z-40">
                        {/* Gradient Backing for readability/separation on mobile */}
                        <div className="absolute inset-x-0 bottom-[-20px] h-[140px] bg-gradient-to-t from-black via-zinc-900 to-transparent md:hidden -z-10 pointer-events-none" />

                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href="#"
                            className={`ticketscloud-widget w-full py-4 md:py-4 rounded-2xl md:rounded-xl flex items-center justify-center gap-2 font-black text-xl md:text-lg uppercase shadow-2xl transition-all ${matchedTcEvent
                                ? 'bg-white text-black hover:bg-cyan-50 border-2 border-white'
                                : 'bg-white/10 text-white/50 cursor-not-allowed'
                                }`}
                            data-tc-event={matchedTcEvent?.id}
                            data-tc-token={import.meta.env.VITE_TC_WIDGET_TOKEN}
                        >
                            <Ticket size={24} className="mb-0.5" />
                            <span>{matchedTcEvent ? 'Купить Билет' : 'Скоро в продаже'}</span>
                        </motion.a>
                    </div>

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
