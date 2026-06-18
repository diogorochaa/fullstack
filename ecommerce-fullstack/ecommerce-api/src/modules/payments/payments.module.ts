import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import {
  CreatePaymentUseCase,
  PaymentWebhookUseCase,
} from 'src/modules/payments/application/use-cases/payment/payment.usecase';
import { PAYMENT_REPOSITORY } from 'src/modules/payments/domain/constants/payment.tokens';
import { PrismaPaymentRepository } from 'src/modules/payments/infrastructure/repositories/prisma-payment.repository';
import { PaymentsController } from 'src/modules/payments/presentation/controllers/payments.controller';
import { EventsModule } from 'src/shared/messaging/events/events.module';

@Module({
  imports: [AuthModule, OrdersModule, EventsModule],
  controllers: [PaymentsController],
  providers: [
    CreatePaymentUseCase,
    PaymentWebhookUseCase,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PrismaPaymentRepository,
    },
  ],
})
export class PaymentsModule {}
