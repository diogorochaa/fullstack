import type { OrderProps } from "../domain/order.js";

export type CreateOrderRepositoryInput = {
  customerEmail: string;
  productSku: string;
  quantity: number;
};

export interface OrderRepository {
  create(input: CreateOrderRepositoryInput): Promise<OrderProps>;
}
