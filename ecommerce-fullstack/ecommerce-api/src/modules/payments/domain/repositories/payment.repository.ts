import { Payment } from '../entities/payment.entity';

export abstract class PaymentRepository {
  abstract create(payment: Payment): Promise<void>;
  abstract update(payment: Payment): Promise<void>;
  abstract findById(id: string): Promise<Payment | null>;
  abstract findPaidByOrderId(orderId: string): Promise<Payment | null>;
  abstract findByExternalId(externalId: string): Promise<Payment | null>;
}
