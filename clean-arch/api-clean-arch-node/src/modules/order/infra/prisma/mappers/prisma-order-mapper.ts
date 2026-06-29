import { Order } from "../../../domain/entity/order";

type PrismaDecimal = {
  toNumber(): number;
};

function decimalToNumber(value: number | PrismaDecimal): number {
  return typeof value === "number" ? value : value.toNumber();
}

export type PrismaOrderModel = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: number | PrismaDecimal;
  createdAt: Date;
  updatedAt: Date;
};

export function prismaOrderToDomain(order: PrismaOrderModel): Order {
  return Order.create({
    id: order.id,
    userId: order.userId,
    productId: order.productId,
    quantity: order.quantity,
    price: decimalToNumber(order.price),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
}

export function orderToPrismaCreate(order: Order): {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: string;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: order.id,
    userId: order.userId,
    productId: order.productId,
    quantity: order.quantity,
    price: order.price.toFixed(2),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
