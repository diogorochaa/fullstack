import { KafkaProducer } from "@kafka-lab/kafka";
import {
  ORDER_CREATED_TOPIC,
  type KafkaMessageMetadata,
  type OrderCreatedEvent,
  recordProcessingEvent
} from "@kafka-lab/shared";
import { randomUUID } from "node:crypto";
import { Order } from "../domain/order.js";
import type { OrderRepository } from "./ports.js";

export type CreateOrderInput = {
  customerEmail: string;
  productSku: string;
  quantity: number;
};

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly producer: KafkaProducer
  ) {}

  async execute(input: CreateOrderInput): Promise<OrderCreatedEvent> {
    const savedOrder = await this.orderRepository.create(input);
    const order = Order.create(savedOrder);
    const orderDto = order.toDto();

    await recordProcessingEvent({
      orderId: orderDto.id,
      stage: "ORDER_CREATED",
      service: "api",
      status: "success",
      message: "Pedido criado no PostgreSQL",
      nextOrderStatus: "CREATED"
    });

    const event: OrderCreatedEvent = {
      eventId: randomUUID(),
      eventName: "orders.created",
      occurredAt: new Date().toISOString(),
      order: orderDto
    };

    const metadata = await this.producer.publish({
      topic: ORDER_CREATED_TOPIC,
      key: orderDto.id,
      value: event
    });

    const firstRecord = metadata[0];

    const kafkaMetadata: KafkaMessageMetadata | undefined = firstRecord
      ? {
          topic: ORDER_CREATED_TOPIC,
          partition: firstRecord.partition,
          offset: firstRecord.baseOffset ?? "0",
          timestamp: new Date().toISOString()
        }
      : undefined;

    await recordProcessingEvent({
      orderId: orderDto.id,
      stage: "EVENT_PUBLISHED",
      service: "api",
      status: "success",
      message: "Evento orders.created produzido",
      ...(kafkaMetadata ? { metadata: kafkaMetadata } : {}),
      nextOrderStatus: "EVENT_PUBLISHED"
    });

    return event;
  }
}
