import { Badge } from "@/components/ui/badge"

import type { ApiStatus } from "@/features/system/hooks/useApiStatus"

type ApiStatusBadgeProps = {
  status: ApiStatus
}

const labelByStatus: Record<ApiStatus, string> = {
  checking: "Verificando API...",
  connected: "API conectada",
  offline: "API offline",
}

const variantByStatus = {
  checking: "warning",
  connected: "success",
  offline: "destructive",
} as const satisfies Record<ApiStatus, "warning" | "success" | "destructive">

export function ApiStatusBadge({ status }: ApiStatusBadgeProps) {
  return <Badge variant={variantByStatus[status]}>{labelByStatus[status]}</Badge>
}
