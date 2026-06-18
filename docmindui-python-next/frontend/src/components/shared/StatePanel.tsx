"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { AlertCircle, CheckCircle2, Inbox, Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { fadeInUp, motionTransition } from "@/lib/motion-variants"
import { cn } from "@/lib/utils"

type StateVariant = "empty" | "error" | "loading" | "success"

const defaultIcons: Record<StateVariant, LucideIcon> = {
  empty: Inbox,
  error: AlertCircle,
  loading: Loader2,
  success: CheckCircle2,
}

type StatePanelProps = {
  variant: StateVariant
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function StatePanel({
  variant,
  title,
  description,
  icon,
  action,
  className,
}: StatePanelProps) {
  const reducedMotion = useReducedMotion()
  const Icon = icon ?? defaultIcons[variant]

  return (
    <motion.div
      role={variant === "loading" ? "status" : undefined}
      aria-live={variant === "loading" ? "polite" : undefined}
      aria-busy={variant === "loading"}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={motionTransition(reducedMotion)}
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-8 text-center",
        className,
      )}
    >
      <Icon
        className={cn(
          "h-10 w-10 text-muted-foreground",
          variant === "loading" && "animate-spin",
          variant === "error" && "text-destructive",
          variant === "success" && "text-emerald-400",
        )}
        aria-hidden
      />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </motion.div>
  )
}
