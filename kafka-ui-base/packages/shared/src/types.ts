export const ORDER_CREATED_TOPIC = "orders.created";
export const ORDER_CREATED_DLQ_TOPIC = "orders.created.dlq";

export type OrderDto = {
  id: string;
  customerEmail: string;
  productSku: string;
  quantity: number;
  createdAt: string;
};

export type OrderCreatedEvent = {
  eventId: string;
  eventName: "orders.created";
  occurredAt: string;
  order: OrderDto;
};

export type ProcessingStage =
  | "ORDER_CREATED"
  | "EVENT_PUBLISHED"
  | "EMAIL_PROCESSED"
  | "STOCK_UPDATED"
  | "ANALYTICS_COMPLETED"
  | "RETRY_SCHEDULED"
  | "DLQ_PUBLISHED";

export type ProcessingStatus = "success" | "failed" | "pending";

export type KafkaMessageMetadata = {
  topic: string;
  partition: number;
  offset: string;
  timestamp: string;
};

export type OrderWithEvents = {
  id: string;
  customerEmail: string;
  productSku: string;
  quantity: number;
  status: string;
  createdAt: string;
  events: Array<{
    id: string;
    orderId: string | null;
    stage: string;
    service: string;
    status: string;
    message: string;
    topic: string | null;
    partition: number | null;
    offset: string | null;
    kafkaTimestamp: string | null;
    createdAt: string;
  }>;
};
