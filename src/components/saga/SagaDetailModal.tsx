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



const SagaDetailModal = ({ event, onClose }: SagaDetailModalProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const { data: tcEvents = [] } = useQuery({
        queryKey: ['events'],
        queryFn: () => ticketsCloudService.getEvents(),
        staleTime: 1000 * 60 * 5
    })

    // Helper: Verify if a specific date string (DD.MM) is "expired" (past 8AM next day in Moscow time)
    const isDateExpired = (dateStr: string) => {
        const [day, month] = dateStr.trim().split('.').map(Number)
        // Get current time in Moscow timezone
        const nowMsk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
        const currentYear = nowMsk.getFullYear()
        const currentMonth = nowMsk.getMonth() + 1
        const seasonStartYear = currentMonth >= 9 ? currentYear : currentYear - 1
        const eventYear = month === 12 ? seasonStartYear : seasonStartYear + 1
        // Create expiry date (8AM next day) in Moscow time
        const expiryDate = new Date(eventYear, month - 1, day + 1, 8, 0, 0)
        return nowMsk > expiryDate
    }

    // Determine default date
    const getInitialDate = () => {
        if (!event.twinEventDates) return event.date
        const activeDate = event.twinEventDates.find(d => !isDateExpired(d.date))
        return activeDate ? activeDate.date : event.twinEventDates[event.twinEventDates.length - 1].date
    }

    const [selectedDate, setSelectedDate] = useState<string>(getInitialDate())

    // Apply data overrides based on selected date
    const currentData = useMemo(() => {
        if (!event.twinEventDates) return event
        const override = event.twinEventDates.find(d => d.date === selectedDate)
        if (!override) return event

        // Merge base event with overrides
        return {
            ...event,
            ...override,
            hooks: { ...event.hooks, ...override.hooks },
            audience: { ...event.audience, ...override.audience },
            // If overrides exist for array fields, use them, else fallback
            vibeLabel: override.vibeLabel || event.vibeLabel,
            visualTheme: override.visualTheme || event.visualTheme,
            dressCode: override.dressCode || event.dressCode
        }
    }, [event, selectedDate])

    // Reset date when event changes
    useEffect(() => {
        setSelectedDate(getInitialDate())
    }, [event.id])

    // Find the specific TC event matching the selected date
    const matchedTcEvent = useMemo(() => {
        if (!tcEvents.length) return null
        const targetDateStr = event.twinEventDates ? selectedDate : event.date.split('-')[0]
        const [targetDay, targetMonth] = targetDateStr.trim().split('.').map(Number)

        return tcEvents.find((tcEvent: any) => {
            if (!tcEvent.rawDate) return false
            const date = new Date(tcEvent.rawDate)
            // Convert to Moscow timezone to get correct day/month
            const mskDay = parseInt(date.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'Europe/Moscow' }))
            const mskMonth = parseInt(date.toLocaleDateString('en-GB', { month: '2-digit', timeZone: 'Europe/Moscow' }))
            return mskDay === targetDay && mskMonth === targetMonth
        })
    }, [tcEvents, selectedDate, event])

    // Toggle body class
    useEffect(() => {
        document.body.classList.add('modal-open-hide-nav')
        return () => document.body.classList.remove('modal-open-hide-nav')
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
                className="relative w-full max-w-5xl bg-[#111] border-t md:border border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[100dvh] md:h-[650px] mt-0 md:mt-0"
                style={{
                    boxShadow: `0 0 50px ${event.accentColor}20`
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white hidden md:block"
                >
                    <X size={20} />
                </button>

                {/* Mobile Handle & Close */}
                <div className="md:hidden absolute top-0 inset-x-0 h-6 z-50 flex justify-center items-center pointer-events-none">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mt-2" />
                </div>
                <button onClick={onClose} className="md:hidden absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur rounded-full text-white">
                    <X size={20} />
                </button>


                {/* Left Side: Poster (Full Height on Desktop, 25vh on Mobile) */}
                <div
                    className="w-full md:w-5/12 relative h-[25vh] md:h-full bg-black overflow-hidden group cursor-zoom-in shrink-0"
                    onClick={() => setLightboxOpen(true)}
                >
                    {matchedTcEvent?.poster_original ? (
                        <>
                            {/* Blur BG */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl scale-125"
                                style={{ backgroundImage: `url(${matchedTcEvent.poster_original})` }}
                            />
                            {/* Main Image */}
                            <motion.img
                                key={matchedTcEvent.poster_original} // Animate switch
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                src={matchedTcEvent.poster_original}
                                alt={currentData.title}
                                className="absolute inset-0 w-full h-full object-cover object-top md:object-cover z-10"
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
                </div>

                {/* Right Side: Content Panel */}
                <div className="w-full md:w-7/12 flex flex-col bg-[#111] relative md:h-full overflow-hidden">

                    {/* Header Section */}
                    <div className="pt-8 px-6 md:px-8 pb-4 shrink-0 z-20 bg-[#111]">
                        <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase leading-none mb-1">
                            {currentData.title}
                        </h2>
                        <p className="text-base md:text-lg text-white/50 font-medium tracking-wide uppercase">
                            {currentData.subtitle}
                        </p>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-32 md:pb-24">

                        {/* Date Switcher (Segmented Control) */}
                        <div className="mb-6">
                            {event.twinEventDates ? (
                                <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10">
                                    {event.twinEventDates.map((twin) => {
                                        const isActive = selectedDate === twin.date
                                        return (
                                            <button
                                                key={twin.date}
                                                onClick={() => setSelectedDate(twin.date)}
                                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isActive
                                                    ? 'bg-white text-black shadow-lg'
                                                    : 'text-white/40 hover:text-white'
                                                    }`}
                                            >
                                                {twin.date}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="inline-flex bg-white/10 px-6 py-2 rounded-full text-sm font-bold text-white border border-white/10">
                                    {event.date}
                                </div>
                            )}
                        </div>

                        {/* Main Hook / Description */}
                        <div className="mb-8 border-l-2 border-cyan-500 pl-4 py-1">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={selectedDate}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="text-white italic text-lg leading-relaxed font-serif text-white/90"
                                >
                                    "{currentData.hooks?.main || currentData.description}"
                                </motion.p>
                            </AnimatePresence>
                            <AnimatePresence mode="wait">
                                {currentData.hooks?.story && (
                                    <motion.p
                                        key={selectedDate + 'story'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-white/40 text-sm mt-2"
                                    >
                                        {currentData.hooks.story}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Info Grid (Gray Cards) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                            {/* Symbols Card */}
                            <div className="bg-[#1a1a1a] rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                    <Flame size={12} /> Символы
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {currentData.vibeIcons?.map((iconName, i) => {
                                        const Icon = getIconByName(iconName)
                                        return <Icon key={i} size={20} className="text-cyan-200" />
                                    })}
                                </div>
                            </div>

                            {/* Audience Card */}
                            <div className="bg-[#1a1a1a] rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                    <Users size={12} /> Для Кого
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(currentData.audience?.perfectFor) ? (
                                        currentData.audience!.perfectFor.map((text, idx) => (
                                            <span key={idx} className="text-white/90 text-sm leading-snug bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                {text}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-white/90 text-sm leading-snug">
                                            {currentData.audience?.perfectFor}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Rows */}
                        <div className="space-y-5 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-cyan-500 shrink-0">
                                    <Music size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase mb-0.5">Визуал & Атмосфера</h4>
                                    <p className="text-sm text-white/60 leading-snug">{currentData.visualTheme}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-cyan-500 shrink-0">
                                    <Shirt size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase mb-0.5">Дресс-код</h4>
                                    <p className="text-white/60 text-sm leading-snug">{currentData.dressCode}</p>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-[10px] text-white/20 italic text-center mt-8 mb-4">
                            "декабрь заканчивается быстрее чем сезон любимого сериала. успеваем в последний вагон"
                        </p>

                    </div>

                    {/* Footer / Buy Button - Sticky at bottom of Right Panel */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#111] via-[#111] to-transparent z-30">
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href="#"
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-lg uppercase shadow-lg transition-all ${matchedTcEvent
                                ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                                }`}
                            data-tc-event={matchedTcEvent?.id}
                            data-tc-token={import.meta.env.VITE_TC_WIDGET_TOKEN}
                        >
                            <Ticket size={20} />
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
