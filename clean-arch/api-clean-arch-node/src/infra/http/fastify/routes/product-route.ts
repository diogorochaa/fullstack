import type { FastifyInstance } from "fastify";
import { CreateProductUseCase } from "../../../../modules/product/application/use-cases/create-product";
import { PrismaProductsRepository } from "../../../../modules/product/infra/prisma/prisma-products-repository";
import { CreateProductController } from "../../../../modules/product/presentation/controllers/create-product-controller";

export async function productRoutes(app: FastifyInstance): Promise<void> {
  const productsRepository = new PrismaProductsRepository();
  const createProductController = new CreateProductController(
    new CreateProductUseCase(productsRepository),
  );

  app.post("/products", createProductController.handle.bind(createProductController));
}
