import SnowOverlay from '../effects/SnowOverlay'

const SagaBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-black -z-10">
            {/* Video Background Placeholder - user will provide video later */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] to-[#000000]">
                {/* Abstract icy shapes or gradient while waiting for video */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://res.cloudinary.com/dv47s6q6b/image/upload/v1701460000/ice-texture.jpg')] bg-cover mix-blend-overlay" />
            </div>

            {/* Dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Snow Effect */}
            <SnowOverlay />

            {/* Vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none" />
        </div>
    )
}

export default SagaBackground
