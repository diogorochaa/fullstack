import { OrderItem } from './order-item.entity';

export class Order {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly addressId: string,
    public readonly status: string,
    public readonly total: number,
    public readonly items: OrderItem[],
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    addressId: string;
    status: string;
    total: number;
    items: OrderItem[];
    createdAt: Date;
  }) {
    return new Order(
      props.id,
      props.userId,
      props.addressId,
      props.status,
      props.total,
      props.items,
      props.createdAt,
    );
  }
}
