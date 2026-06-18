import { ErrorState } from '@/components/feedback/ErrorState'
import { PageTransition } from '@/components/layout/PageTransition'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { parseAppError } from '@/lib/api-error'
import { formatPrice } from '@/lib/format'
import { getOrderStatusLabel } from '@/lib/order-status'
import { ordersService } from '@/services/orders.service'
import { useAuthStore } from '@/stores/auth.store'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const accessToken = useAuthStore((s) => s.accessToken)

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getById(accessToken ?? '', id),
    enabled: Boolean(accessToken && id),
  })

  if (isLoading) {
    return (
      <PageTransition className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Carregando pedido...</p>
      </PageTransition>
    )
  }

  if (isError) {
    const details = parseAppError(error, 'api')
    return (
      <PageTransition className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState error={details} onRetry={() => void refetch()} />
      </PageTransition>
    )
  }

  if (!order) return null

  return (
    <PageTransition className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/pedidos"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para pedidos
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <Badge>{getOrderStatusLabel(order.status)}</Badge>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-muted-foreground">
                  {item.quantity}x {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
