export const KAFKA_TOPICS = {
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  PAYMENT_PAID: 'payment.paid',
  PAYMENT_FAILED: 'payment.failed',
} as const;

export const RABBIT_QUEUES = {
  ORDERS_FULFILLMENT: 'orders.fulfillment',
  IA_REINDEX: 'ia.reindex',
  PAYMENTS_WEBHOOK: 'payments.webhook',
} as const;

export const SOCKET_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_STATUS: 'order:status',
  ORDER_FULFILLMENT: 'order:fulfillment',
  PAYMENT_UPDATED: 'payment:updated',
} as const;
