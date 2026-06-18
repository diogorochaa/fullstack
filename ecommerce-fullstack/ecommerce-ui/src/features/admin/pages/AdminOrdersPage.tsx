import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parseAppError } from '@/lib/api-error'
import { formatItemCount, formatPrice } from '@/lib/format'
import { getOrderStatusLabel } from '@/lib/order-status'
import { adminService } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth.store'
import type { Order } from '@/types/order'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

const STATUS_OPTIONS = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const

export function AdminOrdersPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminService.listOrders(accessToken ?? '', 1, 50),
    enabled: Boolean(accessToken),
  })

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      adminService.updateOrderStatus(accessToken ?? '', orderId, status),
    onSuccess: () => {
      setActionError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => {
      setActionError(parseAppError(err, 'api').message)
    },
  })

  const orders = data?.data ?? []

  if (isError) {
    return (
      <ErrorState
        error={parseAppError(error, 'api')}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe e atualize o status dos pedidos da plataforma.
        </p>
      </div>

      {actionError ? <ErrorAlert error={actionError} /> : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum pedido registrado ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderAdminCard
              key={order.id}
              order={order}
              disabled={statusMutation.isPending}
              onStatusChange={(status) =>
                statusMutation.mutate({ orderId: order.id, status })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderAdminCard({
  order,
  disabled,
  onStatusChange,
}: {
  order: Order
  disabled: boolean
  onStatusChange: (status: string) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString('pt-BR')} ·{' '}
            {formatItemCount(order.items.length)}
          </p>
          <p className="mt-2 text-lg font-bold">{formatPrice(order.total)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{getOrderStatusLabel(order.status)}</Badge>
          <Select
            value={order.status}
            onValueChange={onStatusChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-52">
              <SelectValue>{getOrderStatusLabel(order.status)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {getOrderStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span>
              {item.quantity}x {item.productName}
            </span>
            <span className="text-muted-foreground">
              {formatPrice(item.subtotal)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
