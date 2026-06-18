"use client"

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import { requestMe } from "@/features/auth/api/me-client"
import type { AuthMeMessageRow, AuthSession } from "@/features/auth/types"
import { disconnectChatSocket } from "@/features/chat/api"

const STORAGE_KEY = "docmind:auth"

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.email || !parsed?.accessToken) return null
    return parsed
  } catch {
    return null
  }
}

export type AuthContextValue = {
  session: AuthSession | null
  ready: boolean
  prefetchedMessages: AuthMeMessageRow[] | null
  clearPrefetchedMessages: () => void
  setSession: (session: AuthSession | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
AuthContext.displayName = "Auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null)
  const [prefetchedMessages, setPrefetchedMessages] = useState<AuthMeMessageRow[] | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => {
      const stored = readStoredSession()
      setSessionState(stored)
      if (!stored?.accessToken) {
        setReady(true)
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    const token = session?.accessToken

    if (!token) {
      setPrefetchedMessages(null)
      setReady(true)
      return
    }

    let cancelled = false
    setReady(false)

    ;(async () => {
      try {
        const me = await requestMe(token)
        if (cancelled) return
        setSessionState((prev) => {
          if (!prev?.accessToken) return prev
          const next = { accessToken: prev.accessToken, email: me.email }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          return next
        })
        setPrefetchedMessages(me.messages)
      } catch {
        if (cancelled) return
        window.localStorage.removeItem(STORAGE_KEY)
        setSessionState(null)
        setPrefetchedMessages(null)
      } finally {
        if (!cancelled) setReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [session?.accessToken])

  const setSession = useCallback((next: AuthSession | null) => {
    setSessionState(next)
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const clearPrefetchedMessages = useCallback(() => {
    setPrefetchedMessages(null)
  }, [])

  const logout = useCallback(() => {
    disconnectChatSocket()
    setSession(null)
  }, [setSession])

  const value = useMemo(
    () => ({
      session,
      ready,
      prefetchedMessages,
      clearPrefetchedMessages,
      setSession,
      logout,
    }),
    [session, ready, prefetchedMessages, clearPrefetchedMessages, setSession, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext)
  if (!value) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return value
}

export function displayNameFromEmail(email: string) {
  const local = email.split("@")[0]
  return local.length > 0 ? local : email
}
