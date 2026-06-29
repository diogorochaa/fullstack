import cors from "@fastify/cors";
import { KafkaProducer } from "@kafka-lab/kafka";
import { env, Logger } from "@kafka-lab/shared";
import Fastify from "fastify";
import { CreateOrderUseCase } from "./application/create-order.js";
import { PrismaOrderRepository } from "./infra/prisma-order-repository.js";
import { registerOrderRoutes } from "./presentation/order-routes.js";

const logger = new Logger("API");
const app = Fastify({
  logger: false
});

await app.register(cors, {
  origin: true
});

const producer = new KafkaProducer();
const orderRepository = new PrismaOrderRepository();
const createOrderUseCase = new CreateOrderUseCase(orderRepository, producer);

await registerOrderRoutes(app, createOrderUseCase);

app.get("/health", async () => ({
  status: "ok"
}));

const close = async (): Promise<void> => {
  await producer.disconnect();
  await app.close();
};

process.on("SIGINT", () => {
  void close().then(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void close().then(() => process.exit(0));
});

await app.listen({
  host: "0.0.0.0",
  port: env.apiPort
});

logger.success("API Fastify pronta", {
  port: env.apiPort,
  orders: `POST http://localhost:${env.apiPort}/orders`
});
