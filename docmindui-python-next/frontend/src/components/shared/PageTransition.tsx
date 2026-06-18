"use client"

import { motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { fadeIn, motionTransition } from "@/lib/motion-variants"
import { cn } from "@/lib/utils"

type PageTransitionProps = {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={motionTransition(reducedMotion)}
      className={cn("flex min-h-0 flex-1 flex-col", className)}
    >
      {children}
    </motion.div>
  )
}
