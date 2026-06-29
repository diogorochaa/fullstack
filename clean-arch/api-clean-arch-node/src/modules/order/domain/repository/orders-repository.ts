import type { Order } from "../entity/order";

export interface OrdersRepository {
  create(order: Order): Promise<Order>;
}
