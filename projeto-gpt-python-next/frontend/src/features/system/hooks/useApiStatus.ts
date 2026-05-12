'use client'

import { useEffect, useState } from 'react'

import { checkApiHealth } from '@/services/api/health'

export type ApiStatus = 'checking' | 'connected' | 'offline'

type UseApiStatusOptions = {
  intervalMs?: number
}

export function useApiStatus(options?: UseApiStatusOptions) {
  const intervalMs = options?.intervalMs ?? 15000
  const [status, setStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    let mounted = true

    async function runCheck() {
      const isHealthy = await checkApiHealth()
      if (!mounted) return
      setStatus(isHealthy ? 'connected' : 'offline')
    }

    runCheck()
    const intervalId = setInterval(runCheck, intervalMs)

    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [intervalMs])

  return status
}
