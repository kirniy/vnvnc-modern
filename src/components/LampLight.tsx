import { motion } from "framer-motion"
import { colors } from '../utils/colors'

// Lamp effect with original styling
export const LampLight = () => {
  const redColor = colors.neon.red

  return (
    <div className="absolute inset-x-0 -top-10 md:-top-14 left-1/2 -translate-x-1/2 w-[103%] max-w-[44rem] h-[120px] md:h-[160px] overflow-visible pointer-events-none">
      <div className="relative flex w-full h-full items-center justify-center">

        {/* Horizontal light beam - the TOP element (lamp source) - brighter */}
        <motion.div
          initial={{ width: "15rem", opacity: 0 }}
          whileInView={{ width: "100%", opacity: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-1 w-full top-8 md:top-10"
          style={{
            backgroundColor: redColor,
            boxShadow: `0 0 20px ${redColor}, 0 0 40px ${redColor}40`
          }}
        ></motion.div>

        {/* Red glow BELOW the line - more subtle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{
            delay: 0.5,
            duration: 0.8,
          }}
          className="absolute inset-auto z-40 h-24 w-[90%] top-10 md:top-12 rounded-full blur-3xl"
          style={{ backgroundColor: redColor }}
        ></motion.div>

        {/* Left lamp beam - more subtle */}
        <motion.div
          initial={{ opacity: 0.4, width: "8rem" }}
          whileInView={{ opacity: 0.7, width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 top-8 md:top-10 h-28 md:h-36 overflow-hidden w-[16rem] bg-gradient-conic from-red-500/60 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        />

        {/* Right lamp beam - more subtle */}
        <motion.div
          initial={{ opacity: 0.4, width: "8rem" }}
          whileInView={{ opacity: 0.7, width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 top-8 md:top-10 h-28 md:h-36 w-[16rem] bg-gradient-conic from-transparent via-transparent to-red-500/60 text-white [--conic-position:from_290deg_at_center_top]"
        />

        {/* Additional glow below for depth - more subtle */}
        <motion.div
          initial={{ width: "6rem", opacity: 0 }}
          whileInView={{ width: "14rem", opacity: 0.3 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-24 w-56 top-14 md:top-16 rounded-full blur-2xl"
          style={{ backgroundColor: `${redColor}40` }}
        ></motion.div>
      </div>
    </div>
  )
}