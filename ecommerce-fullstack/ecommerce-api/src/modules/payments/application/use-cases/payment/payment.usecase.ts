import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { ORDER_REPOSITORY } from 'src/modules/orders/domain/constants/order.tokens';
import { OrderNotFoundException } from 'src/modules/orders/domain/exceptions/order-not-found.exception';
import { OrderRepository } from 'src/modules/orders/domain/repositories/order.repository';
import { CreatePaymentDto } from 'src/modules/payments/application/dto/create-payment.dto';
import { PaymentWebhookDto } from 'src/modules/payments/application/dto/payment-webhook.dto';
import { PAYMENT_REPOSITORY } from 'src/modules/payments/domain/constants/payment.tokens';
import { Payment } from 'src/modules/payments/domain/entities/payment.entity';
import { InvalidPaymentException } from 'src/modules/payments/domain/exceptions/invalid-payment.exception';
import { PaymentNotFoundException } from 'src/modules/payments/domain/exceptions/payment-not-found.exception';
import { PaymentRepository } from 'src/modules/payments/domain/repositories/payment.repository';
import { DomainEventsService } from 'src/shared/messaging/events/domain-events.service';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly events: DomainEventsService,
  ) {}

  async execute(userId: string, input: CreatePaymentDto) {
    const order = await this.orderRepository.findByUserIdAndId(
      userId,
      input.orderId,
    );

    if (!order) {
      throw new OrderNotFoundException(input.orderId);
    }

    if (order.status === 'PAID') {
      const existingPayment = await this.paymentRepository.findPaidByOrderId(
        order.id,
      );

      if (existingPayment) {
        return existingPayment;
      }
    }

    if (order.status !== 'PENDING') {
      throw new InvalidPaymentException('Order is not pending payment');
    }

    const payment = Payment.create({
      id: randomUUID(),
      orderId: order.id,
      amount: order.total,
    });

    await this.paymentRepository.create(payment);

    const paidPayment = payment.markPaid(`sim-${payment.id}`);
    await this.paymentRepository.update(paidPayment);
    await this.orderRepository.updateStatus(order.id, 'PAID');

    await this.events.paymentPaid({
      paymentId: paidPayment.id,
      orderId: paidPayment.orderId,
      userId: order.userId,
      amount: paidPayment.amount,
      status: paidPayment.status,
      externalId: paidPayment.externalId,
    });

    return paidPayment;
  }
}

@Injectable()
export class PaymentWebhookUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly events: DomainEventsService,
  ) {}

  async execute(input: PaymentWebhookDto) {
    const payment = await this.paymentRepository.findById(input.paymentId);

    if (!payment) {
      throw new PaymentNotFoundException(input.paymentId);
    }

    const orderForQueue = await this.orderRepository.findById(payment.orderId);

    await this.events.paymentWebhookQueued({
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: orderForQueue?.userId ?? '',
      amount: payment.amount,
      status: input.status,
      externalId: input.externalId,
    });

    if (input.externalId) {
      const byExternalId = await this.paymentRepository.findByExternalId(
        input.externalId,
      );

      if (byExternalId && byExternalId.id !== payment.id) {
        return byExternalId;
      }
    }

    const result = payment.applyWebhook({
      status: input.status,
      externalId: input.externalId,
    });

    if (result.shouldPersist) {
      await this.paymentRepository.update(result.payment);
    }

    if (result.shouldUpdateOrder) {
      const order = await this.orderRepository.findById(payment.orderId);

      if (order && order.status !== 'PAID') {
        await this.orderRepository.updateStatus(payment.orderId, 'PAID');
      }
    }

    const order = await this.orderRepository.findById(payment.orderId);
    const eventPayload = {
      paymentId: result.payment.id,
      orderId: result.payment.orderId,
      userId: order?.userId ?? '',
      amount: result.payment.amount,
      status: result.payment.status,
      externalId: result.payment.externalId,
    };

    if (result.payment.status === 'PAID') {
      await this.events.paymentPaid(eventPayload);
    } else if (result.payment.status === 'FAILED') {
      await this.events.paymentFailed(eventPayload);
    }

    return result.payment;
  }
}
