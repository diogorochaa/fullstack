import type { Transition, Variants } from "framer-motion"

export const easeOut = [0.22, 1, 0.36, 1] as const

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
}

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

export const defaultTransition: Transition = {
  duration: 0.35,
  ease: easeOut,
}

export const hoverLift = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2, ease: easeOut },
}

export function motionTransition(reducedMotion: boolean): Transition {
  if (reducedMotion) {
    return { duration: 0 }
  }
  return defaultTransition
}
