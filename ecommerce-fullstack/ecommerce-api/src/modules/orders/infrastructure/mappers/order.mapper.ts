import { OrderItem } from '../../domain/entities/order-item.entity';
import { Order } from '../../domain/entities/order.entity';

type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: { toNumber?: () => number } | number | string;
};

type OrderRecord = {
  id: string;
  userId: string;
  addressId: string;
  status: string;
  total: { toNumber?: () => number } | number | string;
  createdAt: Date;
  items: OrderItemRecord[];
};

export class OrderMapper {
  static itemToDomain(record: OrderItemRecord): OrderItem {
    return new OrderItem(
      record.id,
      record.orderId,
      record.productId,
      record.productName,
      record.quantity,
      Number(record.unitPrice),
    );
  }

  static toDomain(record: OrderRecord): Order {
    return Order.create({
      id: record.id,
      userId: record.userId,
      addressId: record.addressId,
      status: record.status,
      total: Number(record.total),
      items: record.items.map((item) => OrderMapper.itemToDomain(item)),
      createdAt: record.createdAt,
    });
  }
}
