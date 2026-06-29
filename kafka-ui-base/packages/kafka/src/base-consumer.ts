import {
  type KafkaMessageMetadata,
  Logger,
  ORDER_CREATED_DLQ_TOPIC,
  prisma
} from "@kafka-lab/shared";
import type { Consumer, EachMessagePayload, IHeaders } from "kafkajs";
import { createKafka } from "./connection.js";
import { KafkaProducer } from "./producer.js";

type EventWithId = {
  eventId: string;
  order?: {
    id: string;
  };
};

type ConsumerHandler<TEvent extends EventWithId> = (
  event: TEvent,
  metadata: KafkaMessageMetadata
) => Promise<void>;

type BaseConsumerOptions<TEvent extends EventWithId> = {
  serviceName: string;
  groupId: string;
  topic: string;
  logger: Logger;
  handler: ConsumerHandler<TEvent>;
  maxRetries?: number;
  dlqTopic?: string;
  onSuccess?: (event: TEvent, metadata: KafkaMessageMetadata) => Promise<void>;
  onRetry?: (event: TEvent, metadata: KafkaMessageMetadata, retry: number, error: Error) => Promise<void>;
  onDlq?: (event: TEvent, metadata: KafkaMessageMetadata, error: Error) => Promise<void>;
};

export abstract class BaseConsumer<TEvent extends EventWithId> {
  private readonly consumer: Consumer;
  private readonly producer = new KafkaProducer();
  private readonly maxRetries: number;
  private readonly dlqTopic: string;

  protected constructor(private readonly options: BaseConsumerOptions<TEvent>) {
    this.consumer = createKafka(`${options.serviceName}-consumer`).consumer({
      groupId: options.groupId
    });
    this.maxRetries = options.maxRetries ?? 3;
    this.dlqTopic = options.dlqTopic ?? ORDER_CREATED_DLQ_TOPIC;
  }

  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.options.topic,
      fromBeginning: false
    });

    this.options.logger.success("Consumer iniciado", {
      group: this.options.groupId,
      topic: this.options.topic
    });

    await this.consumer.run({
      eachMessage: async (payload) => this.consume(payload)
    });
  }

  private async consume(payload: EachMessagePayload): Promise<void> {
    const event = this.parseMessage(payload.message.value);
    const metadata = this.toMetadata(payload);
    const processedId = `${this.options.serviceName}:${event.eventId}`;

    const alreadyProcessed = await prisma.processedMessage.findUnique({
      where: { id: processedId }
    });

    if (alreadyProcessed) {
      this.options.logger.warn("Mensagem duplicada ignorada", {
        eventId: event.eventId,
        offset: metadata.offset
      });
      return;
    }

    try {
      await this.options.handler(event, metadata);
      await prisma.processedMessage.create({
        data: {
          id: processedId,
          service: this.options.serviceName,
          eventId: event.eventId,
          topic: metadata.topic,
          partition: metadata.partition,
          offset: metadata.offset
        }
      });
      await this.options.onSuccess?.(event, metadata);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      await this.handleFailure(event, metadata, payload.message.headers, normalizedError);
    }
  }

  private async handleFailure(
    event: TEvent,
    metadata: KafkaMessageMetadata,
    headers: IHeaders | undefined,
    error: Error
  ): Promise<void> {
    const retry = this.getRetryCount(headers) + 1;

    if (retry <= this.maxRetries) {
      this.options.logger.warn("Falha no processamento. Reenfileirando retry", {
        orderId: event.order?.id ?? "-",
        retry,
        error: error.message
      });

      await this.producer.publish({
        topic: this.options.topic,
        key: event.order?.id ?? event.eventId,
        value: event,
        headers: {
          "x-retry-count": String(retry),
          "x-original-topic": metadata.topic,
          "x-error": error.message
        }
      });

      await this.options.onRetry?.(event, metadata, retry, error);
      return;
    }

    this.options.logger.error("Mensagem enviada para DLQ", error);

    await this.producer.publish({
      topic: this.dlqTopic,
      key: event.order?.id ?? event.eventId,
      value: {
        event,
        failure: {
          service: this.options.serviceName,
          reason: error.message,
          failedAt: new Date().toISOString(),
          originalTopic: metadata.topic,
          originalPartition: metadata.partition,
          originalOffset: metadata.offset
        }
      }
    });

    await this.options.onDlq?.(event, metadata, error);
  }

  private parseMessage(value: Buffer | null): TEvent {
    if (!value) {
      throw new Error("Kafka message value is empty");
    }

    const parsed = JSON.parse(value.toString("utf8")) as unknown;

    if (!this.hasEventId(parsed)) {
      throw new Error("Kafka message does not contain eventId");
    }

    return parsed;
  }

  private hasEventId(value: unknown): value is TEvent {
    return typeof value === "object" && value !== null && "eventId" in value;
  }

  private toMetadata(payload: EachMessagePayload): KafkaMessageMetadata {
    return {
      topic: payload.topic,
      partition: payload.partition,
      offset: payload.message.offset,
      timestamp: new Date(Number(payload.message.timestamp)).toISOString()
    };
  }

  private getRetryCount(headers: IHeaders | undefined): number {
    const value = headers?.["x-retry-count"];

    if (!value) {
      return 0;
    }

    const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
    const parsed = Number(text);

    return Number.isFinite(parsed) ? parsed : 0;
  }
}
