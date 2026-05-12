import { Badge } from '@mantine/core'

import type { ApiStatus } from '@/features/system/hooks/useApiStatus'

type ApiStatusBadgeProps = {
  status: ApiStatus
}

const labelByStatus: Record<ApiStatus, string> = {
  checking: 'Verificando API...',
  connected: 'API conectada',
  offline: 'API offline',
}

const colorByStatus: Record<ApiStatus, string> = {
  checking: 'yellow',
  connected: 'green',
  offline: 'red',
}

export function ApiStatusBadge({ status }: ApiStatusBadgeProps) {
  return (
    <Badge color={colorByStatus[status]} variant="light">
      {labelByStatus[status]}
    </Badge>
  )
}
