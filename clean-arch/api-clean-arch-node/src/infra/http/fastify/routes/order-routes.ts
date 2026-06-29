import type { FastifyInstance } from "fastify";
import { CreateOrderUseCase } from "../../../../modules/order/application/use-cases/create-order";
import { PrismaOrdersRepository } from "../../../../modules/order/infra/prisma/prisma-orders-repository";
import { CreateOrderController } from "../../../../modules/order/presentation/controllers/create-order-controller";
import { PrismaProductsRepository } from "../../../../modules/product/infra/prisma/prisma-products-repository";
import { PrismaUsersRepository } from "../../../../modules/user/infra/prisma/prisma-users-repository";

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  const ordersRepository = new PrismaOrdersRepository();
  const usersRepository = new PrismaUsersRepository();
  const productsRepository = new PrismaProductsRepository();
  const createOrderController = new CreateOrderController(
    new CreateOrderUseCase(ordersRepository, usersRepository, productsRepository),
  );

  app.post("/orders", createOrderController.handle.bind(createOrderController));
}
