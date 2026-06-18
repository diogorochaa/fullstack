import { OrderItem } from 'src/modules/orders/domain/entities/order-item.entity';
import { Order } from 'src/modules/orders/domain/entities/order.entity';
import { PaginatedResult } from 'src/shared/types/paginated-result';

export class OrderItemResponse {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly subtotal: number,
  ) {}

  static fromEntity(item: OrderItem): OrderItemResponse {
    return new OrderItemResponse(
      item.id,
      item.productId,
      item.productName,
      item.quantity,
      item.unitPrice,
      item.subtotal(),
    );
  }
}

export class OrderResponse {
  constructor(
    public readonly id: string,
    public readonly addressId: string,
    public readonly status: string,
    public readonly total: number,
    public readonly items: OrderItemResponse[],
    public readonly createdAt: string,
  ) {}

  static fromEntity(order: Order): OrderResponse {
    return new OrderResponse(
      order.id,
      order.addressId,
      order.status,
      order.total,
      order.items.map((item) => OrderItemResponse.fromEntity(item)),
      order.createdAt.toISOString(),
    );
  }
}

export class PaginatedOrderResponse {
  constructor(
    public readonly data: OrderResponse[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly totalPages: number,
  ) {}

  static fromResult(result: PaginatedResult<Order>): PaginatedOrderResponse {
    return new PaginatedOrderResponse(
      result.data.map((order) => OrderResponse.fromEntity(order)),
      result.total,
      result.page,
      result.limit,
      result.totalPages,
    );
  }
}
