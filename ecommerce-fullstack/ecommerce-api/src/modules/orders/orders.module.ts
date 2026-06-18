import { Module } from '@nestjs/common';
import { AddressesModule } from 'src/modules/addresses/addresses.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CartModule } from 'src/modules/cart/cart.module';
import { CreateOrderUseCase } from 'src/modules/orders/application/use-cases/create-order/create-order.usecase';
import {
  GetOrderUseCase,
  ListOrdersUseCase,
} from 'src/modules/orders/application/use-cases/get-order/get-order.usecase';
import { ORDER_REPOSITORY } from 'src/modules/orders/domain/constants/order.tokens';
import { PrismaOrderRepository } from 'src/modules/orders/infrastructure/repositories/prisma-order.repository';
import { OrdersController } from 'src/modules/orders/presentation/controllers/orders.controller';
import { ProductsModule } from 'src/modules/products/products.module';
import { EventsModule } from 'src/shared/messaging/events/events.module';

@Module({
  imports: [
    AuthModule,
    CartModule,
    ProductsModule,
    AddressesModule,
    EventsModule,
  ],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderUseCase,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
