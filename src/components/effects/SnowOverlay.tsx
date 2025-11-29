import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    radius: number
    speedY: number
    speedX: number
    opacity: number
    swing: number
    swingStep: number
}

const SnowOverlay = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []

        // Configuration for "stylish" snow
        const particleCount = window.innerWidth < 768 ? 50 : 150 // Fewer particles on mobile

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const createParticles = () => {
            particles = []
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    // Varied sizes for depth: 0.5 to 2.5px
                    radius: Math.random() * 2 + 0.5,
                    // Varied speeds: faster for larger (closer) particles
                    speedY: Math.random() * 1 + 0.5,
                    speedX: Math.random() * 0.5 - 0.25,
                    // Varied opacity for depth
                    opacity: Math.random() * 0.5 + 0.1,
                    swing: Math.random() * 3,
                    swingStep: Math.random() * 0.02
                })
            }
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((p) => {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
                ctx.fill()
            })
        }

        const update = () => {
            particles.forEach((p) => {
                p.y += p.speedY
                p.x += Math.sin(p.swing) * 0.5 + p.speedX
                p.swing += p.swingStep

                // Reset if out of view
                if (p.y > canvas.height) {
                    p.y = -10
                    p.x = Math.random() * canvas.width
                }
                if (p.x > canvas.width) {
                    p.x = 0
                } else if (p.x < 0) {
                    p.x = canvas.width
                }
            })
        }

        const loop = () => {
            update()
            draw()
            animationFrameId = requestAnimationFrame(loop)
        }

        // Initialize
        resizeCanvas()
        createParticles()
        loop()

        // Event listeners
        window.addEventListener('resize', () => {
            resizeCanvas()
            createParticles() // Re-create to fill new area
        })

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ mixBlendMode: 'screen' }} // Adds to the "stylish" feel by blending nicely
        />
    )
}

export default SnowOverlay
