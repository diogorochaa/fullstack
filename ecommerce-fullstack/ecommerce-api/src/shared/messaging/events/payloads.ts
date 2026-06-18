export type DomainEvent<T> = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  payload: T;
};

export type ProductEventPayload = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  active: boolean;
  categoryId: string;
};

export type OrderCreatedPayload = {
  orderId: string;
  userId: string;
  addressId: string;
  total: number;
  itemCount: number;
  status: string;
};

export type OrderStatusChangedPayload = {
  orderId: string;
  userId: string;
  previousStatus: string;
  status: string;
};

export type PaymentEventPayload = {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  status: string;
  externalId?: string | null;
};

export type IaReindexPayload = {
  action: 'upsert' | 'delete' | 'full';
  productId?: string;
};
