import { InvalidOrderPriceError } from "../errors/invalid-order-price-error";
import { InvalidOrderQuantityError } from "../errors/invalid-order-quantity-error";

export type OrderProps = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(props: OrderProps): Order {
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new InvalidOrderQuantityError(props.quantity);
    }

    if (props.price <= 0) {
      throw new InvalidOrderPriceError(props.price);
    }

    return new Order(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get price(): number {
    return this.props.price;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get total(): number {
    return this.props.quantity * this.props.price;
  }
}
