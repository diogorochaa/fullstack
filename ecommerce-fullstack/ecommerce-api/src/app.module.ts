import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import kafkaConfig from './shared/messaging/kafka/kafka.config';
import { KafkaModule } from './shared/messaging/kafka/kafka.module';
import rabbitmqConfig from './shared/messaging/rabbitmq/rabbitmq.config';
import { RabbitmqModule } from './shared/messaging/rabbitmq/rabbitmq.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { SocketModule } from './shared/socket/socket.module';
import { ObservabilityModule } from './shared/observability/observability.module';
import throttleConfig from './shared/throttle/throttle.config';

@Module({
  imports: [
    ObservabilityModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [kafkaConfig, rabbitmqConfig, throttleConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttl') ?? 60_000,
          limit: config.get<number>('throttle.limit') ?? 100,
        },
      ],
    }),
    PrismaModule,
    KafkaModule,
    RabbitmqModule,
    SocketModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    AddressesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
