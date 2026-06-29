import { BaseConsumer } from "@kafka-lab/kafka";
import {
  Logger,
  ORDER_CREATED_TOPIC,
  type OrderCreatedEvent,
  recordProcessingEvent,
  sleep
} from "@kafka-lab/shared";

const logger = new Logger("EMAIL");

export class EmailConsumer extends BaseConsumer<OrderCreatedEvent> {
  constructor() {
    super({
      serviceName: "email",
      groupId: process.env.CONSUMER_GROUP ?? "email-service",
      topic: ORDER_CREATED_TOPIC,
      logger,
      handler: async (event) => {
        logger.info("Recebido pedido", {
          id: event.order.id
        });
        logger.info("Enviando email...");

        if (event.order.productSku === "FAIL_EMAIL") {
          throw new Error("Falha simulada no envio de email");
        }

        await sleep(2000);
      },
      onSuccess: async (event, metadata) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "EMAIL_PROCESSED",
          service: "email",
          status: "success",
          message: "Email enviado ao cliente",
          metadata,
          nextOrderStatus: "EMAIL_PROCESSED"
        });
      },
      onRetry: async (event, metadata, retry, error) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "RETRY_SCHEDULED",
          service: "email",
          status: "failed",
          message: `Retry ${retry}: ${error.message}`,
          metadata
        });
      },
      onDlq: async (event, metadata, error) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "DLQ_PUBLISHED",
          service: "email",
          status: "failed",
          message: error.message,
          metadata,
          nextOrderStatus: "DLQ_FAILED"
        });
      }
    });
  }
}
