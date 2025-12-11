import type { ReactNode } from 'react'
import SagaPosterWall from './SagaPosterWall'
import SnowOverlay from '../effects/SnowOverlay'

interface WinterSagaLayoutProps {
    children: ReactNode
}

const WinterSagaLayout = ({ children }: WinterSagaLayoutProps) => {
    return (
        <div className="relative min-h-screen bg-black overflow-hidden selection:bg-cyan-500/30">
            {/* Background Layer - Animated Poster Wall */}
            <div className="fixed inset-0 z-0">
                <SagaPosterWall />
            </div>

            {/* Weather Effects - Fixed Overlay */}
            <div className="fixed inset-0 z-10 pointer-events-none mix-blend-screen">
                <SnowOverlay />
            </div>

            {/* Vignette & Atmosphere - Reduced opacity */}
            <div className="fixed inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60" />

            {/* Scrollable Content */}
            <div className="relative z-20 container mx-auto px-4 py-8 md:py-16">
                {children}
            </div>
        </div>
    )
}

export default WinterSagaLayout
