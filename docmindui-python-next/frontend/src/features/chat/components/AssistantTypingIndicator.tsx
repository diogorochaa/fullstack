"use client"

import { cn } from "@/lib/utils"

type AssistantTypingIndicatorProps = {
  label?: string
  className?: string
}

export function AssistantTypingIndicator({
  label = "DocMind está respondendo…",
  className,
}: AssistantTypingIndicatorProps) {
  return (
    <div
      className={cn("flex items-center gap-3 text-muted-foreground", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="flex items-center gap-1" aria-hidden>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 rounded-full bg-brand-pink motion-safe:animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span className="text-sm">{label}</span>
    </div>
  )
}
