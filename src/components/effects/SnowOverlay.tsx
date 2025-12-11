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
        if (w < 768) return 10 // Reduced further for mobile
        if (w < 1280) return 24
        return 45
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const connection = (navigator as any)?.connection as { saveData?: boolean } | undefined
        const saveData = Boolean(connection?.saveData)
        const prefersReducedMotion = motionQuery?.matches ?? false

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
        if (motionQuery?.addEventListener) {
            motionQuery.addEventListener('change', handleResize)
        } else if (motionQuery?.addListener) {
            motionQuery.addListener(handleResize)
        }

        const allowAnimation = !prefersReducedMotion && !saveData
        const targetFps = allowAnimation
            ? (window.innerWidth < 768 ? 20 : 28)
            : 0

        const maxSnowflakes = allowAnimation
            ? getSnowflakeCount(window.innerWidth)
            : Math.min(12, getSnowflakeCount(window.innerWidth))
        const snowflakes: Snowflake[] = []

        const createSnowflake = (): Snowflake => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.5,
            speed: Math.random() * 1 + 0.2,
            wind: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.4 + 0.1
        })

        for (let i = 0; i < maxSnowflakes; i++) {
            snowflakes.push(createSnowflake())
        }

        let animationFrameId: number
        let lastFrame = performance.now()

        const drawFrame = (timestamp: number) => {
            if (allowAnimation && timestamp - lastFrame < 1000 / targetFps) {
                animationFrameId = requestAnimationFrame(drawFrame)
                return
            }

            lastFrame = timestamp
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            snowflakes.forEach((flake) => {
                if (allowAnimation) {
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
                }

                ctx.beginPath()
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`
                ctx.fill()
            })

            if (!allowAnimation) return
            animationFrameId = requestAnimationFrame(drawFrame)
        }

        animationFrameId = requestAnimationFrame(drawFrame)

        return () => {
            window.removeEventListener('resize', handleResize)
            if (motionQuery?.removeEventListener) {
                motionQuery.removeEventListener('change', handleResize)
            } else if (motionQuery?.removeListener) {
                motionQuery.removeListener(handleResize)
            }
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
