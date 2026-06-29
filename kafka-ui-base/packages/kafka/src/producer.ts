import { Logger } from "@kafka-lab/shared";
import type { Message, RecordMetadata } from "kafkajs";
import { createKafka } from "./connection.js";

type PublishInput<TValue extends object> = {
  topic: string;
  key: string;
  value: TValue;
  headers?: Record<string, string>;
};

export class KafkaProducer {
  private readonly producer = createKafka("kafka-learning-lab-producer").producer();
  private readonly logger = new Logger("KAFKA");
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    await this.producer.connect();
    this.connected = true;
    this.logger.success("Producer conectado");
  }

  async publish<TValue extends object>(input: PublishInput<TValue>): Promise<RecordMetadata[]> {
    await this.connect();

    this.logger.info("Publicando evento", {
      topic: input.topic,
      key: input.key
    });

    const message: Message = {
      key: input.key,
      value: JSON.stringify(input.value)
    };

    if (input.headers) {
      message.headers = input.headers;
    }

    return this.producer.send({
      topic: input.topic,
      messages: [message]
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    await this.producer.disconnect();
    this.connected = false;
  }
}
