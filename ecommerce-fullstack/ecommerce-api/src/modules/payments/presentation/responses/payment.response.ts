import { Payment } from 'src/modules/payments/domain/entities/payment.entity';

export class PaymentResponse {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly status: string,
    public readonly provider: string,
    public readonly externalId: string | null,
  ) {}

  static fromEntity(payment: Payment): PaymentResponse {
    return new PaymentResponse(
      payment.id,
      payment.orderId,
      payment.amount,
      payment.status,
      payment.provider,
      payment.externalId,
    );
  }
}
