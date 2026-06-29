import type { Order } from "../../domain/entity/order";
import type { OrderResponseDto } from "../dtos/order-response-dto";

export function orderToResponseDto(order: Order): OrderResponseDto {
  return {
    id: order.id,
    userId: order.userId,
    productId: order.productId,
    quantity: order.quantity,
    price: order.price,
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
