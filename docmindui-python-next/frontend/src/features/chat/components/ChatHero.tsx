"use client"

import { motion } from "framer-motion"

import { AppLogo } from "@/components/shared/AppLogo"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { motionTransition } from "@/lib/motion-variants"

export function ChatHero() {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className="flex max-w-xl flex-col items-center text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionTransition(reducedMotion)}
    >
      <AppLogo size="lg" className="mb-4 sm:mb-6" />
      <h1 className="text-2xl font-semibold tracking-tight text-gradient-brand sm:text-3xl md:text-4xl">
        Como posso ajudar você hoje?
      </h1>
      <p className="mt-2 px-2 text-sm text-muted-foreground sm:mt-3 sm:px-0 md:text-base">
        Envie uma pergunta, anexe uma imagem para análise visual ou um PDF para indexar.
      </p>
    </motion.div>
  )
}
