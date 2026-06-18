import { ErrorState } from '@/components/feedback/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/features/admin/components/StatCard'
import { parseAppError } from '@/lib/api-error'
import { formatPrice } from '@/lib/format'
import { getOrderStatusLabel } from '@/lib/order-status'
import { adminService } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth.store'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  Package,
  PieChart as PieChartIcon,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PAID: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
}

const PIE_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
]

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-')
  const date = new Date(Number(year), Number(monthNum) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

export function AdminDashboardPage() {
  const accessToken = useAuthStore((s) => s.accessToken)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(accessToken ?? ''),
    enabled: Boolean(accessToken),
  })

  if (isError) {
    const details = parseAppError(error, 'api')
    const isStatsRouteMissing =
      details.code === 'NOT_FOUND' &&
      (details.message.includes('/admin/stats') ||
        details.message.includes('Cannot GET'))

    return (
      <ErrorState
        error={{
          ...details,
          title: isStatsRouteMissing ? 'API desatualizada' : details.title,
          message: isStatsRouteMissing
            ? 'O endpoint /admin/stats não existe na API em execução. Reinicie a API (npm run start:dev na pasta ecommerce-api) e rode o seed para carregar vendas de demonstração.'
            : details.message,
        }}
        onRetry={() => void refetch()}
      />
    )
  }

  if (isLoading || !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando métricas...</p>
    )
  }

  const revenueChartData = data.revenueByMonth.map((item) => ({
    month: formatMonthLabel(item.month),
    receita: item.revenue,
    pedidos: item.orders,
  }))

  const statusPieData = Object.entries(data.ordersByStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: getOrderStatusLabel(status),
      value: count,
      status,
    }))

  const productsPieData = data.topProducts.map((product) => ({
    name: product.productName,
    value: product.revenue,
  }))

  const stackedChartData = (data.ordersByMonthStatus ?? []).map((item) => ({
    month: formatMonthLabel(item.month),
    Pago: item.PAID,
    Enviado: item.SHIPPED,
    Entregue: item.DELIVERED,
    Pendente: item.PENDING,
    Cancelado: item.CANCELLED,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral de vendas, usuários e histórico da plataforma.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Receita total"
          value={formatPrice(data.totalRevenue)}
          hint={`${formatPrice(data.revenueThisMonth)} neste mês`}
          icon={DollarSign}
        />
        <StatCard
          title="Pedidos"
          value={String(data.totalOrders)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Usuários"
          value={String(data.totalUsers)}
          hint={`${data.totalAdmins} administrador(es)`}
          icon={Users}
        />
        <StatCard
          title="Produtos ativos"
          value={String(data.totalProducts)}
          icon={Package}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="size-4" />
              Pedidos por status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {statusPieData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem pedidos para exibir.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusPieData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? PIE_COLORS[0]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="size-4" />
              Receita por produto
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {productsPieData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem vendas registradas ainda.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productsPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {productsPieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatPrice(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" />
              Receita mensal (barras)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'receita' ? formatPrice(value) : value
                  }
                />
                <Legend />
                <Bar
                  dataKey="receita"
                  name="Receita"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pedidos"
                  name="Pedidos"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Pedidos por status (lista)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor: STATUS_COLORS[status] ?? '#94a3b8',
                    }}
                  />
                  {getOrderStatusLabel(status)}
                </span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pedidos por mês e status (barras empilhadas)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="Entregue"
                stackId="status"
                fill={STATUS_COLORS.DELIVERED}
              />
              <Bar
                dataKey="Enviado"
                stackId="status"
                fill={STATUS_COLORS.SHIPPED}
              />
              <Bar dataKey="Pago" stackId="status" fill={STATUS_COLORS.PAID} />
              <Bar
                dataKey="Pendente"
                stackId="status"
                fill={STATUS_COLORS.PENDING}
              />
              <Bar
                dataKey="Cancelado"
                stackId="status"
                fill={STATUS_COLORS.CANCELLED}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma venda registrada ainda.
              </p>
            ) : (
              data.topProducts.map((product) => (
                <div
                  key={product.productName}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-muted-foreground">
                      {product.quantity} unidade(s)
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum pedido recente.
              </p>
            ) : (
              data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <Badge variant="outline" className="mt-1">
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
