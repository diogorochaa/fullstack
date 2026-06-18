import { Module } from '@nestjs/common';
import { SocketModule } from 'src/shared/socket/socket.module';
import { KafkaModule } from '../kafka/kafka.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { DomainEventsService } from './domain-events.service';

@Module({
  imports: [KafkaModule, RabbitmqModule, SocketModule],
  providers: [DomainEventsService],
  exports: [DomainEventsService],
})
export class EventsModule {}
