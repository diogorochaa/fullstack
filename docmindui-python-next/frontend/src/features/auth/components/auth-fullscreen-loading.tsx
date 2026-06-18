"use client"

import { Loader2 } from "lucide-react"

import { AppLogo } from "@/components/shared/AppLogo"

export function AuthFullscreenLoading() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando"
    >
      <div className="chat-ambient-glow" aria-hidden />
      <AppLogo size="lg" />
      <Loader2 className="h-8 w-8 animate-spin text-brand-pink" aria-hidden />
      <p className="text-sm text-muted-foreground">Carregando…</p>
    </div>
  )
}
