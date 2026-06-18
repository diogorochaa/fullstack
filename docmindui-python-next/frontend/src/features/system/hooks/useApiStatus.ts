"use client"

import { type ApiStatus, useHealthQuery } from "@/features/system/hooks/useHealthQuery"

export type { ApiStatus }

type UseApiStatusOptions = {
  intervalMs?: number
}

/** @deprecated Prefer useHealthQuery directly */
export function useApiStatus(options?: UseApiStatusOptions) {
  const { status } = useHealthQuery(options?.intervalMs ?? 15_000)
  return status
}
