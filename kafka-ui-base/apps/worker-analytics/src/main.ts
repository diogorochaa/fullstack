import { Logger } from "@kafka-lab/shared";
import { AnalyticsConsumer } from "./analytics-consumer.js";

const logger = new Logger("ANALYTICS");
const consumer = new AnalyticsConsumer();

process.on("SIGINT", () => {
  logger.warn("Encerrando worker de analytics");
  process.exit(0);
});

await consumer.start();
