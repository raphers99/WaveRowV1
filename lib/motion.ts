export const MOTION = {
  duration: { fast: 0.15, base: 0.25, slow: 0.5 },
  ease: [0.25, 0.46, 0.45, 0.94] as const,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 }
}

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: MOTION.ease } }
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export const scaleTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 }
}

export const cardHover = {
  whileHover: { y: -4, boxShadow: "0 20px 40px rgba(0,103,71,0.12)" },
  transition: { duration: 0.25 }
}
