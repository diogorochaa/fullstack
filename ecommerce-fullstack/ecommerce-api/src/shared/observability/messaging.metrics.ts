import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter } from 'prom-client';

@Injectable()
export class MessagingMetricsService {
  constructor(
    @InjectMetric('kafka_messages_published_total')
    private readonly kafkaPublished: Counter<string>,
    @InjectMetric('rabbitmq_messages_published_total')
    private readonly rabbitPublished: Counter<string>,
    @InjectMetric('rabbitmq_messages_consumed_total')
    private readonly rabbitConsumed: Counter<string>,
  ) {}

  recordKafkaPublish(topic: string): void {
    this.kafkaPublished.inc({ topic });
  }

  recordRabbitPublish(queue: string): void {
    this.rabbitPublished.inc({ queue });
  }

  recordRabbitConsume(queue: string): void {
    this.rabbitConsumed.inc({ queue });
  }
}
