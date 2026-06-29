import { Logger } from "@kafka-lab/shared";
import { EmailConsumer } from "./email-consumer.js";

const logger = new Logger("EMAIL");
const consumer = new EmailConsumer();

process.on("SIGINT", () => {
  logger.warn("Encerrando worker de email");
  process.exit(0);
});

await consumer.start();
