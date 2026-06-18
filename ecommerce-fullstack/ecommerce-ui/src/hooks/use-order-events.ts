import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect, useState } from 'react'

type OrderNotification = {
  type: 'created' | 'status' | 'fulfillment' | 'payment'
  message: string
  orderId?: string
}

export function useOrderEvents() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.user?.id)
  const [notification, setNotification] = useState<OrderNotification | null>(
    null,
  )

  useEffect(() => {
    if (!isAuthenticated || !userId) return

    const socket = getSocket('/events')
    socket.connect()

    function handleCreated(payload: { userId: string; orderId: string }) {
      if (payload.userId !== userId) return
      setNotification({
        type: 'created',
        orderId: payload.orderId,
        message: 'Pedido criado com sucesso!',
      })
    }

    function handleStatus(payload: {
      userId: string
      orderId: string
      status: string
    }) {
      if (payload.userId !== userId) return
      setNotification({
        type: 'status',
        orderId: payload.orderId,
        message: `Pedido atualizado: ${payload.status}`,
      })
    }

    function handleFulfillment(payload: {
      userId: string
      orderId: string
      message: string
    }) {
      if (payload.userId !== userId) return
      setNotification({
        type: 'fulfillment',
        orderId: payload.orderId,
        message: payload.message,
      })
    }

    function handlePayment(payload: {
      userId: string
      orderId: string
      status: string
    }) {
      if (payload.userId && payload.userId !== userId) return
      setNotification({
        type: 'payment',
        orderId: payload.orderId,
        message: `Pagamento: ${payload.status}`,
      })
    }

    socket.on('order:created', handleCreated)
    socket.on('order:status', handleStatus)
    socket.on('order:fulfillment', handleFulfillment)
    socket.on('payment:updated', handlePayment)

    return () => {
      socket.off('order:created', handleCreated)
      socket.off('order:status', handleStatus)
      socket.off('order:fulfillment', handleFulfillment)
      socket.off('payment:updated', handlePayment)
      socket.disconnect()
    }
  }, [isAuthenticated, userId])

  function dismiss() {
    setNotification(null)
  }

  return { notification, dismiss }
}
