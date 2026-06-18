"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/features/auth/context"

import { AuthFullscreenLoading } from "./auth-fullscreen-loading"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!session) {
      router.replace("/login")
    }
  }, [ready, session, router])

  if (!ready) {
    return <AuthFullscreenLoading />
  }

  if (!session) {
    return null
  }

  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>
}
