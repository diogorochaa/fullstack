import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Channel, ConsumeMessage } from 'amqplib';
import amqp from 'amqplib';
import { MessagingMetricsService } from 'src/shared/observability/messaging.metrics';
import { logStructured } from 'src/shared/observability/structured-log.util';
import { EventsGateway } from 'src/shared/socket/events.gateway';
import type { OrderCreatedPayload } from '../events/payloads';
import { RABBIT_QUEUES, SOCKET_EVENTS } from '../events/topics';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

@Injectable()
export class RabbitmqConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqConsumerService.name);
  private connection: AmqpConnection | null = null;
  private channel: Channel | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly eventsGateway: EventsGateway,
    private readonly messagingMetrics: MessagingMetricsService,
  ) {}

  async onModuleInit() {
    this.startConsumers().catch((error) => {
      this.logger.warn(
        `RabbitMQ consumers not started: ${error instanceof Error ? error.message : error}`,
      );
    });
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      const url =
        this.config.get<string>('rabbitmq.url') ??
        'amqp://rabbit:rabbit@localhost:5672';

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
    }

    return this.channel;
  }

  private async startConsumers(): Promise<void> {
    const channel = await this.getChannel();

    await channel.assertQueue(RABBIT_QUEUES.ORDERS_FULFILLMENT, {
      durable: true,
    });
    await channel.assertQueue(RABBIT_QUEUES.PAYMENTS_WEBHOOK, {
      durable: true,
    });

    await channel.consume(RABBIT_QUEUES.ORDERS_FULFILLMENT, (message) => {
      this.handleFulfillment(message, channel);
    });

    await channel.consume(RABBIT_QUEUES.PAYMENTS_WEBHOOK, (message) => {
      this.handlePaymentWebhook(message, channel);
    });

    this.logger.log('RabbitMQ consumers started');
  }

  private handleFulfillment(
    message: ConsumeMessage | null,
    channel: Channel,
  ): void {
    if (!message) return;

    try {
      const event = JSON.parse(message.content.toString()) as {
        payload: OrderCreatedPayload;
      };
      const order = event.payload;

      this.messagingMetrics.recordRabbitConsume(RABBIT_QUEUES.ORDERS_FULFILLMENT);
      logStructured(this.logger, 'log', 'RabbitMQ message consumed', {
        queue: RABBIT_QUEUES.ORDERS_FULFILLMENT,
        eventType: 'order.fulfillment',
        orderId: order.orderId,
      });

      this.eventsGateway.broadcast(SOCKET_EVENTS.ORDER_FULFILLMENT, {
        orderId: order.orderId,
        userId: order.userId,
        status: 'processing',
        message: 'Pedido em preparação para envio',
      });

      channel.ack(message);
    } catch (error) {
      this.logger.error(
        `Fulfillment consumer error: ${error instanceof Error ? error.message : error}`,
      );
      channel.nack(message, false, false);
    }
  }

  private handlePaymentWebhook(
    message: ConsumeMessage | null,
    channel: Channel,
  ): void {
    if (!message) return;

    try {
      const payload = JSON.parse(message.content.toString()) as {
        paymentId: string;
        orderId: string;
        status: string;
      };

      this.messagingMetrics.recordRabbitConsume(RABBIT_QUEUES.PAYMENTS_WEBHOOK);
      logStructured(this.logger, 'log', 'RabbitMQ message consumed', {
        queue: RABBIT_QUEUES.PAYMENTS_WEBHOOK,
        eventType: 'payment.webhook',
        paymentId: payload.paymentId,
        status: payload.status,
      });

      channel.ack(message);
    } catch (error) {
      this.logger.error(
        `Payment webhook consumer error: ${error instanceof Error ? error.message : error}`,
      );
      channel.nack(message, false, false);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
