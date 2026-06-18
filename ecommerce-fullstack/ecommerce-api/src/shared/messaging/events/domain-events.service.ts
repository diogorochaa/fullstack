import { randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';
import { MessagingMetricsService } from 'src/shared/observability/messaging.metrics';
import { logStructured } from 'src/shared/observability/structured-log.util';
import { EventsGateway } from 'src/shared/socket/events.gateway';
import { KafkaService } from '../kafka/kafka.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import type {
  DomainEvent,
  IaReindexPayload,
  OrderCreatedPayload,
  OrderStatusChangedPayload,
  PaymentEventPayload,
  ProductEventPayload,
} from './payloads';
import { KAFKA_TOPICS, RABBIT_QUEUES, SOCKET_EVENTS } from './topics';

@Injectable()
export class DomainEventsService {
  private readonly logger = new Logger(DomainEventsService.name);

  constructor(
    private readonly kafka: KafkaService,
    private readonly rabbitmq: RabbitmqService,
    private readonly eventsGateway: EventsGateway,
    private readonly messagingMetrics: MessagingMetricsService,
  ) {}

  private wrap<T>(eventType: string, payload: T): DomainEvent<T> {
    return {
      eventId: randomUUID(),
      eventType,
      occurredAt: new Date().toISOString(),
      payload,
    };
  }

  private async emitKafka(topic: string, event: unknown): Promise<void> {
    try {
      await this.kafka.emit(topic, event);
      this.messagingMetrics.recordKafkaPublish(topic);
      logStructured(this.logger, 'log', 'Kafka message published', {
        topic,
        eventType:
          typeof event === 'object' &&
          event !== null &&
          'eventType' in event &&
          typeof event.eventType === 'string'
            ? event.eventType
            : topic,
      });
    } catch (error) {
      logStructured(this.logger, 'warn', 'Kafka emit failed', {
        topic,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async publishRabbit(queue: string, message: unknown): Promise<void> {
    try {
      await this.rabbitmq.publish(queue, message);
      this.messagingMetrics.recordRabbitPublish(queue);
      logStructured(this.logger, 'log', 'RabbitMQ message published', {
        queue,
        eventType:
          typeof message === 'object' &&
          message !== null &&
          'action' in message &&
          typeof message.action === 'string'
            ? message.action
            : queue,
      });
    } catch (error) {
      logStructured(this.logger, 'warn', 'RabbitMQ publish failed', {
        queue,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private broadcastSocket(event: string, payload: unknown): void {
    try {
      this.eventsGateway.broadcast(event, payload);
    } catch (error) {
      this.logger.warn(
        `Socket broadcast failed [${event}]: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async productCreated(payload: ProductEventPayload): Promise<void> {
    const event = this.wrap(KAFKA_TOPICS.PRODUCT_CREATED, payload);
    await this.emitKafka(KAFKA_TOPICS.PRODUCT_CREATED, event);
    await this.publishRabbit(RABBIT_QUEUES.IA_REINDEX, {
      action: 'upsert',
      productId: payload.id,
    } satisfies IaReindexPayload);
  }

  async productUpdated(payload: ProductEventPayload): Promise<void> {
    const event = this.wrap(KAFKA_TOPICS.PRODUCT_UPDATED, payload);
    await this.emitKafka(KAFKA_TOPICS.PRODUCT_UPDATED, event);
    await this.publishRabbit(RABBIT_QUEUES.IA_REINDEX, {
      action: payload.active ? 'upsert' : 'delete',
      productId: payload.id,
    } satisfies IaReindexPayload);
  }

  async productDeleted(
    payload: Pick<ProductEventPayload, 'id'>,
  ): Promise<void> {
    const event = this.wrap(KAFKA_TOPICS.PRODUCT_DELETED, payload);
    await this.emitKafka(KAFKA_TOPICS.PRODUCT_DELETED, event);
    await this.publishRabbit(RABBIT_QUEUES.IA_REINDEX, {
      action: 'delete',
      productId: payload.id,
    } satisfies IaReindexPayload);
  }

  async orderCreated(payload: OrderCreatedPayload): Promise<void> {
    const event = this.wrap(KAFKA_TOPICS.ORDER_CREATED, payload);
    await this.emitKafka(KAFKA_TOPICS.ORDER_CREATED, event);
    await this.publishRabbit(RABBIT_QUEUES.ORDERS_FULFILLMENT, event);
    this.broadcastSocket(SOCKET_EVENTS.ORDER_CREATED, payload);
  }

  async orderStatusChanged(payload: OrderStatusChangedPayload): Promise<void> {
    const event = this.wrap(KAFKA_TOPICS.ORDER_STATUS_CHANGED, payload);
    await this.emitKafka(KAFKA_TOPICS.ORDER_STATUS_CHANGED, event);
    this.broadcastSocket(SOCKET_EVENTS.ORDER_STATUS, payload);
  }

  async paymentPaid(payload: PaymentEventPayload): Promise<void> {
    const event = this.wrap(KAFKA_TOPICS.PAYMENT_PAID, payload);
    await this.emitKafka(KAFKA_TOPICS.PAYMENT_PAID, event);
    this.broadcastSocket(SOCKET_EVENTS.PAYMENT_UPDATED, payload);
  }

  async paymentFailed(payload: PaymentEventPayload): Promise<void> {
    const event = this.wrap(KAFKA_TOPICS.PAYMENT_FAILED, payload);
    await this.emitKafka(KAFKA_TOPICS.PAYMENT_FAILED, event);
    this.broadcastSocket(SOCKET_EVENTS.PAYMENT_UPDATED, payload);
  }

  async paymentWebhookQueued(payload: PaymentEventPayload): Promise<void> {
    await this.publishRabbit(RABBIT_QUEUES.PAYMENTS_WEBHOOK, payload);
  }
}
