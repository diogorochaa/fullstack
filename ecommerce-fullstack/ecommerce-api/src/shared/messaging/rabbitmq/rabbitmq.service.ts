import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { type Channel } from 'amqplib';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private connection: AmqpConnection | null = null;
  private channel: Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async getChannel(): Promise<Channel> {
    if (!this.channel) {
      const url =
        this.config.get<string>('rabbitmq.url') ??
        'amqp://rabbit:rabbit@localhost:5672';

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
    }

    return this.channel;
  }

  async publish(queue: string, message: unknown): Promise<void> {
    const channel = await this.getChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
