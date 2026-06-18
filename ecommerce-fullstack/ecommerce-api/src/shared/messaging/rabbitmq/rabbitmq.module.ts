import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from 'src/shared/socket/socket.module';
import rabbitmqConfig from './rabbitmq.config';
import { RabbitmqConsumerService } from './rabbitmq.consumer';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  imports: [ConfigModule.forFeature(rabbitmqConfig), SocketModule],
  providers: [RabbitmqService, RabbitmqConsumerService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
