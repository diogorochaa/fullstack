"use client"

import type { ReactElement } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type ButtonWithTooltipProps = {
  tooltip: string
  side?: "top" | "right" | "bottom" | "left"
  children: ReactElement
}

/** Envolve um botão (ou trigger) com tooltip visível no hover/foco. */
export function ButtonWithTooltip({ tooltip, side = "top", children }: ButtonWithTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
