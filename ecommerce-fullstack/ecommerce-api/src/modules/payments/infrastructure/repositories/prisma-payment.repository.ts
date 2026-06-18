import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payment: Payment): Promise<void> {
    const data = PaymentMapper.toPersistence(payment);

    await this.prisma.payment.create({
      data: {
        ...data,
        status: data.status as 'PENDING' | 'PAID' | 'FAILED',
      },
    });
  }

  async update(payment: Payment): Promise<void> {
    const { id, status, ...data } = PaymentMapper.toPersistence(payment);

    await this.prisma.payment.update({
      where: { id },
      data: {
        ...data,
        status: status as 'PENDING' | 'PAID' | 'FAILED',
      },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return null;
    }

    return PaymentMapper.toDomain(payment);
  }

  async findPaidByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId, status: 'PAID' },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      return null;
    }

    return PaymentMapper.toDomain(payment);
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findFirst({
      where: { externalId },
    });

    if (!payment) {
      return null;
    }

    return PaymentMapper.toDomain(payment);
  }
}
