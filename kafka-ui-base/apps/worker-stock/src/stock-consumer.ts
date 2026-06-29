import { BaseConsumer } from "@kafka-lab/kafka";
import {
  Logger,
  ORDER_CREATED_TOPIC,
  type OrderCreatedEvent,
  recordProcessingEvent,
  sleep
} from "@kafka-lab/shared";

const logger = new Logger("STOCK");

export class StockConsumer extends BaseConsumer<OrderCreatedEvent> {
  constructor() {
    super({
      serviceName: "stock",
      groupId: process.env.CONSUMER_GROUP ?? "stock-service",
      topic: ORDER_CREATED_TOPIC,
      logger,
      handler: async (event) => {
        logger.info("Recebido pedido", {
          id: event.order.id
        });
        logger.info("Baixando estoque...");

        if (event.order.productSku === "FAIL_STOCK") {
          throw new Error("Falha simulada na baixa de estoque");
        }

        await sleep(1000);
      },
      onSuccess: async (event, metadata) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "STOCK_UPDATED",
          service: "stock",
          status: "success",
          message: "Estoque atualizado",
          metadata,
          nextOrderStatus: "STOCK_UPDATED"
        });
      },
      onRetry: async (event, metadata, retry, error) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "RETRY_SCHEDULED",
          service: "stock",
          status: "failed",
          message: `Retry ${retry}: ${error.message}`,
          metadata
        });
      },
      onDlq: async (event, metadata, error) => {
        await recordProcessingEvent({
          orderId: event.order.id,
          stage: "DLQ_PUBLISHED",
          service: "stock",
          status: "failed",
          message: error.message,
          metadata,
          nextOrderStatus: "DLQ_FAILED"
        });
      }
    });
  }
}
