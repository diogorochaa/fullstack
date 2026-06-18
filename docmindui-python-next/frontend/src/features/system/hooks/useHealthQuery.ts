"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

import { checkApiHealth } from "@/features/system/api"
import { queryKeys } from "@/lib/query-keys"
import { toastWarning } from "@/lib/toast"

export type ApiStatus = "checking" | "connected" | "offline"

export function useHealthQuery(intervalMs = 15_000) {
  const wasConnectedRef = useRef(false)

  const query = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => checkApiHealth(),
    refetchInterval: intervalMs,
    staleTime: intervalMs / 2,
  })

  const status: ApiStatus = query.isPending ? "checking" : query.data ? "connected" : "offline"

  useEffect(() => {
    if (status === "connected") {
      wasConnectedRef.current = true
      return
    }
    if (status === "offline" && wasConnectedRef.current) {
      toastWarning("A API está offline. Algumas funções podem não funcionar.")
      wasConnectedRef.current = false
    }
  }, [status])

  return { status, query }
}
