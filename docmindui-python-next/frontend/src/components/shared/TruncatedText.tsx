"use client"

import { useEffect, useRef, useState } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type TruncatedTextProps = {
  text: string
  className?: string
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

/** Texto com reticências quando não couber; tooltip com o conteúdo completo só se estiver truncado. */
export function TruncatedText({ text, className, tooltipSide = "right" }: TruncatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reavalia truncamento quando o texto muda
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const check = () => setTruncated(el.scrollWidth > el.clientWidth)
    check()

    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text])

  return (
    <Tooltip>
      <TooltipTrigger asChild disabled={!truncated}>
        <span ref={ref} className={cn("min-w-0 flex-1 truncate", className)}>
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} className="max-w-xs wrap-break-word">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
