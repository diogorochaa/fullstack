import { Logger } from "@kafka-lab/shared";
import { StockConsumer } from "./stock-consumer.js";

const logger = new Logger("STOCK");
const consumer = new StockConsumer();

process.on("SIGINT", () => {
  logger.warn("Encerrando worker de estoque");
  process.exit(0);
});

await consumer.start();
