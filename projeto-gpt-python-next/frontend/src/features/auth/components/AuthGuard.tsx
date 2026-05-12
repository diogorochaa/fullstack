'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/features/auth/context'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!session) {
      router.replace('/login')
    }
  }, [ready, session, router])

  if (!ready || !session) {
    return null
  }

  return <>{children}</>
}
