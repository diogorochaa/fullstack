import { BaseConsumer } from "@kafka-lab/kafka";
import {
  Logger,
  ORDER_CREATED_TOPIC,
  prisma,
  type OrderCreatedEvent,
  recordProcessingEvent,
  sleep
} from "@kafka-lab/shared";

const logger = new Logger("ANALYTICS");

export class AnalyticsConsumer extends BaseConsumer<OrderCreatedEvent> {
  constructor() {
    super({
      serviceName: "analytics",
      groupId: process.env.CONSUMER_GROUP ?? "analytics-service",
      topic: ORDER_CREATED_TOPIC,
      logger,
      handler: async (event) => {
        logger.info("Recebido pedido", {
          id: event.order.id
        });
        logger.info("Atualizando metricas...");

        if (event.order.productSku === "FAIL_ANALYTICS") {
          throw new Error("Falha simulada no analytics");
        }

        await sleep(500);

        await prisma.analyticsMetric.upsert({
          where: { name: "orders_created_total" },
          create: {
            name: "orders_created_total",
            value: 1
          },
          update: {
            value: {
              increment: 1
            }
          }
        });
      },
      onSuccess: async (event, metadata) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "ANALYTICS_COMPLETED",
          service: "analytics",
          status: "success",
          message: "Metricas atualizadas",
          metadata,
          nextOrderStatus: "ANALYTICS_COMPLETED"
        });
      },
      onRetry: async (event, metadata, retry, error) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "RETRY_SCHEDULED",
          service: "analytics",
          status: "failed",
          message: `Retry ${retry}: ${error.message}`,
          metadata
        });
      },
      onDlq: async (event, metadata, error) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "DLQ_PUBLISHED",
          service: "analytics",
          status: "failed",
          message: error.message,
          metadata,
          nextOrderStatus: "DLQ_FAILED"
        });
      }
    });
  }
}
