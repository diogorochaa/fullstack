import { Payment } from '../../domain/entities/payment.entity';

type PaymentRecord = {
  id: string;
  orderId: string;
  amount: { toNumber?: () => number } | number | string;
  status: string;
  provider: string;
  externalId: string | null;
};

export class PaymentMapper {
  static toPersistence(payment: Payment) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      provider: payment.provider,
      externalId: payment.externalId,
    };
  }

  static toDomain(record: PaymentRecord): Payment {
    return Payment.create({
      id: record.id,
      orderId: record.orderId,
      amount: Number(record.amount),
      status: record.status,
      provider: record.provider,
      externalId: record.externalId,
    });
  }
}
