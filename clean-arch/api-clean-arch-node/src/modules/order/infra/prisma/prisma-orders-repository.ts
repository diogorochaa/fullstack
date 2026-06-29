import { prisma } from "../../../../infra/database/prisma";
import type { Order } from "../../domain/entity/order";
import type { OrdersRepository } from "../../domain/repository/orders-repository";
import { orderToPrismaCreate, prismaOrderToDomain } from "./mappers/prisma-order-mapper";

export class PrismaOrdersRepository implements OrdersRepository {
  async create(data: Order): Promise<Order> {
    const order = await prisma.order.create({
      data: orderToPrismaCreate(data),
    });
    return prismaOrderToDomain(order);
  }
}
