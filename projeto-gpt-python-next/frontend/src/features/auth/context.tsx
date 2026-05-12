'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { AuthSession } from '@/features/auth/types'

const STORAGE_KEY = 'docmind:auth'

type AuthContextValue = {
  session: AuthSession | null
  ready: boolean
  setSession: (session: AuthSession | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSessionState(readStoredSession())
      setReady(true)
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const setSession = useCallback((next: AuthSession | null) => {
    setSessionState(next)
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const logout = useCallback(() => {
    setSession(null)
  }, [setSession])

  const value = useMemo(
    () => ({ session, ready, setSession, logout }),
    [session, ready, setSession, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}

export function displayNameFromEmail(email: string) {
  const local = email.split('@')[0]
  return local.length > 0 ? local : email
}
