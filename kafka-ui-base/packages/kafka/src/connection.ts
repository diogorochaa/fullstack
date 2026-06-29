import { env } from "@kafka-lab/shared";
import { Kafka, logLevel } from "kafkajs";

export const createKafka = (clientId: string): Kafka =>
  new Kafka({
    clientId,
    brokers: env.kafkaBrokers,
    logLevel: logLevel.NOTHING
  });
