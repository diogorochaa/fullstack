const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  PAID: 'Pago',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

const ACTIVE_STATUSES = new Set(['PENDING', 'PAID', 'SHIPPED'])
const HISTORY_STATUSES = new Set(['DELIVERED', 'CANCELLED'])

export function getOrderStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

export function isActiveOrder(status: string): boolean {
  return ACTIVE_STATUSES.has(status)
}

export function isHistoryOrder(status: string): boolean {
  return HISTORY_STATUSES.has(status)
}
