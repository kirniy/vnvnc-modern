import { useEffect, useRef } from 'react'

interface Snowflake {
    x: number
    y: number
    radius: number
    speed: number
    wind: number
    opacity: number
}

const SnowOverlay = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Determine number of snowflakes based on screen width
    const getSnowflakeCount = (w: number) => {
        if (w < 768) return 20 // Significantly reduced for mobile
        if (w < 1024) return 60
        return 100
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // helper to set size
        const handleResize = () => {
            if (canvas) {
                const vw = window.visualViewport?.width || window.innerWidth
                const vh = window.visualViewport?.height || window.innerHeight
                canvas.width = vw
                canvas.height = vh
            }
        }

        // Initial size
        handleResize()
        window.addEventListener('resize', handleResize)

        const maxSnowflakes = getSnowflakeCount(window.innerWidth)
        const snowflakes: Snowflake[] = []

        const createSnowflake = (): Snowflake => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.5,
            speed: Math.random() * 1 + 0.2,
            wind: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.4 + 0.1
        })

        // Populate
        for (let i = 0; i < maxSnowflakes; i++) {
            snowflakes.push(createSnowflake())
        }

        let animationFrameId: number

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            snowflakes.forEach((flake) => {
                flake.y += flake.speed
                flake.x += flake.wind

                // Wrap around
                if (flake.y > canvas.height) {
                    flake.y = -5
                    flake.x = Math.random() * canvas.width
                }
                if (flake.x > canvas.width) {
                    flake.x = 0
                } else if (flake.x < 0) {
                    flake.x = canvas.width
                }

                ctx.beginPath()
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`
                ctx.fill()
            })

            // Adjust snowflake count dynamically if width changes significantly in a way that matters,
            // but simpler to just keep current set for smooth resize usually.
            // If we really want dynamic count on resize, we'd need to re-init arrays. 
            // For now constant set based on init width is safer for perf.

            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, []) // Run once on mount, internal resize listener handles dimension updates

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ mixBlendMode: 'screen' }}
        />
    )
}

export default SnowOverlay
