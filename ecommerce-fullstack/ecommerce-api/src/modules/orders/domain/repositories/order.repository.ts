import { PaginatedResult } from 'src/shared/types/paginated-result';
import { Order } from '../entities/order.entity';

export type CreateOrderItemInput = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export abstract class OrderRepository {
  abstract createFromCart(params: {
    userId: string;
    addressId: string;
    cartId: string;
    items: CreateOrderItemInput[];
    total: number;
  }): Promise<Order>;
  abstract findById(id: string): Promise<Order | null>;
  abstract findByUserIdAndId(userId: string, id: string): Promise<Order | null>;
  abstract findByUserId(userId: string): Promise<Order[]>;
  abstract findAllPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Order>>;
  abstract updateStatus(id: string, status: string): Promise<Order>;
  abstract transitionStatus(
    id: string,
    fromStatus: string,
    toStatus: string,
  ): Promise<Order>;
}
