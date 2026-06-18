"use client"

import { useQuery } from "@tanstack/react-query"

import { requestMessages } from "@/features/chat/api"
import { queryKeys } from "@/lib/query-keys"

export function useMessagesQuery(token: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.messages(token ?? ""),
    queryFn: () => requestMessages(token),
    enabled: Boolean(token) && enabled,
    staleTime: 60_000,
  })
}
