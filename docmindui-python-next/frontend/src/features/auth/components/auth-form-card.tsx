"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { AppLogo } from "@/components/shared/AppLogo"
import { PageTransition } from "@/components/shared/PageTransition"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { fadeInUp, motionTransition } from "@/lib/motion-variants"

type AuthFormCardProps = {
  title: string
  description: string
  footer: ReactNode
  children: ReactNode
}

export function AuthFormCard({ title, description, footer, children }: AuthFormCardProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative flex min-h-dvh-screen items-center justify-center overflow-hidden bg-background p-4 px-safe pb-safe pt-safe">
      <div className="chat-ambient-glow" aria-hidden />
      <PageTransition className="w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={motionTransition(reducedMotion)}
        >
          <Card className="glass-panel border-border/60 shadow-soft">
            <CardHeader className="items-center text-center">
              <AppLogo size="md" className="mb-2" />
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={motionTransition(reducedMotion)}
              >
                <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">{description}</CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>{children}</CardContent>
            <CardFooter className="flex flex-col gap-4">{footer}</CardFooter>
          </Card>
        </motion.div>
      </PageTransition>
    </div>
  )
}
