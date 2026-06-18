import { ErrorState } from '@/components/feedback/ErrorState'
import { PageTransition } from '@/components/layout/PageTransition'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { parseAppError } from '@/lib/api-error'
import { formatItemCount, formatPrice } from '@/lib/format'
import {
  getOrderStatusLabel,
  isActiveOrder,
  isHistoryOrder,
} from '@/lib/order-status'
import { ordersService } from '@/services/orders.service'
import { useAuthStore } from '@/stores/auth.store'
import type { Order } from '@/types/order'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function OrderCard({ order, index }: { order: Order; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">
              Pedido #{order.id.slice(0, 8)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString('pt-BR')} ·{' '}
              {formatItemCount(order.items.length)}
            </p>
          </div>
          <Badge variant="outline">{getOrderStatusLabel(order.status)}</Badge>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-lg font-bold">{formatPrice(order.total)}</p>
          <Link
            to={`/pedidos/${order.id}`}
            className="inline-flex h-7 items-center rounded-full border border-border px-3 text-sm font-medium hover:bg-muted"
          >
            Ver detalhes
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function OrdersList({
  orders,
  emptyMessage,
}: {
  orders: Order[]
  emptyMessage: string
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <OrderCard key={order.id} order={order} index={index} />
      ))}
    </div>
  )
}

export function OrdersPage() {
  const accessToken = useAuthStore((s) => s.accessToken)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersService.list(accessToken ?? ''),
    enabled: Boolean(accessToken),
  })

  const orders = data ?? []
  const activeOrders = orders.filter((o) => isActiveOrder(o.status))
  const historyOrders = orders.filter((o) => isHistoryOrder(o.status))

  if (isError) {
    const details = parseAppError(error, 'api')
    return (
      <PageTransition className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState error={details} onRetry={() => void refetch()} />
      </PageTransition>
    )
  }

  return (
    <PageTransition className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para a loja
      </Link>

      <h1 className="mt-6 text-2xl font-bold">Meus pedidos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Acompanhe compras em andamento e histórico.
      </p>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Carregando pedidos...
        </p>
      ) : (
        <Tabs defaultValue="active" className="mt-8">
          <TabsList>
            <TabsTrigger value="active">
              Em andamento ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Histórico ({historyOrders.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6">
            <OrdersList
              orders={activeOrders}
              emptyMessage="Nenhum pedido em andamento no momento."
            />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <OrdersList
              orders={historyOrders}
              emptyMessage="Seu histórico de pedidos aparecerá aqui."
            />
          </TabsContent>
        </Tabs>
      )}
    </PageTransition>
  )
}
