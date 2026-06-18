export class Payment {
  private constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly status: string,
    public readonly provider: string,
    public readonly externalId: string | null,
  ) {}

  static create(props: {
    id: string;
    orderId: string;
    amount: number;
    status?: string;
    provider?: string;
    externalId?: string | null;
  }) {
    return new Payment(
      props.id,
      props.orderId,
      props.amount,
      props.status ?? 'PENDING',
      props.provider ?? 'simulated',
      props.externalId ?? null,
    );
  }

  markPaid(externalId?: string) {
    return Payment.create({
      id: this.id,
      orderId: this.orderId,
      amount: this.amount,
      status: 'PAID',
      provider: this.provider,
      externalId: externalId ?? this.externalId,
    });
  }

  updateStatus(status: string, externalId?: string) {
    return Payment.create({
      id: this.id,
      orderId: this.orderId,
      amount: this.amount,
      status,
      provider: this.provider,
      externalId: externalId ?? this.externalId,
    });
  }

  isPaid(): boolean {
    return this.status === 'PAID';
  }

  hasStatus(status: string): boolean {
    return this.status === status;
  }

  applyWebhook(input: { status: string; externalId?: string }): {
    payment: Payment;
    shouldUpdateOrder: boolean;
    shouldPersist: boolean;
  } {
    if (this.hasStatus(input.status)) {
      return {
        payment: this,
        shouldUpdateOrder: false,
        shouldPersist: false,
      };
    }

    if (this.isPaid()) {
      return {
        payment: this,
        shouldUpdateOrder: false,
        shouldPersist: false,
      };
    }

    const payment = this.updateStatus(input.status, input.externalId);

    return {
      payment,
      shouldUpdateOrder: input.status === 'PAID',
      shouldPersist: true,
    };
  }
}
