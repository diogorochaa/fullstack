import { prisma } from "@kafka-lab/shared";
import type { OrderProps } from "../domain/order.js";
import type { CreateOrderRepositoryInput, OrderRepository } from "../application/ports.js";

export class PrismaOrderRepository implements OrderRepository {
  async create(input: CreateOrderRepositoryInput): Promise<OrderProps> {
    const order = await prisma.order.create({
      data: {
        customerEmail: input.customerEmail,
        productSku: input.productSku,
        quantity: input.quantity
      }
    });

    return {
      id: order.id,
      customerEmail: order.customerEmail,
      productSku: order.productSku,
      quantity: order.quantity,
      createdAt: order.createdAt
    };
  }
}
