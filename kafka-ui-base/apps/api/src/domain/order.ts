export type OrderProps = {
  id: string;
  customerEmail: string;
  productSku: string;
  quantity: number;
  createdAt: Date;
};

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(props: OrderProps): Order {
    if (props.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    return new Order(props);
  }

  toDto() {
    return {
      id: this.props.id,
      customerEmail: this.props.customerEmail,
      productSku: this.props.productSku,
      quantity: this.props.quantity,
      createdAt: this.props.createdAt.toISOString()
    };
  }
}
