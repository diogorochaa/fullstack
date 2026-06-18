import { Button } from '@/components/ui/button'
import { useOrderEvents } from '@/hooks/use-order-events'
import { X } from 'lucide-react'

export function OrderNotification() {
  const { notification, dismiss } = useOrderEvents()

  if (!notification) return null

  return (
    <output
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-lg"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {notification.type === 'created' && 'Novo pedido'}
          {notification.type === 'status' && 'Status do pedido'}
          {notification.type === 'fulfillment' && 'Preparando envio'}
          {notification.type === 'payment' && 'Pagamento'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {notification.message}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={dismiss}
        aria-label="Fechar notificação"
      >
        <X className="size-4" />
      </Button>
    </output>
  )
}
