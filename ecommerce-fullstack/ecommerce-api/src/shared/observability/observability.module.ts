import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { HttpMetricsInterceptor } from './http-metrics.interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { MessagingMetricsService } from './messaging.metrics';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [
    makeCounterProvider({
      name: 'kafka_messages_published_total',
      help: 'Total Kafka messages published',
      labelNames: ['topic'],
    }),
    makeCounterProvider({
      name: 'rabbitmq_messages_published_total',
      help: 'Total RabbitMQ messages published',
      labelNames: ['queue'],
    }),
    makeCounterProvider({
      name: 'rabbitmq_messages_consumed_total',
      help: 'Total RabbitMQ messages consumed',
      labelNames: ['queue'],
    }),
    MessagingMetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [MessagingMetricsService, PrometheusModule],
})
export class ObservabilityModule {}
