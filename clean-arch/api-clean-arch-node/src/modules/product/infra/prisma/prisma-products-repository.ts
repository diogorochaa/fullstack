import { prisma } from "../../../../infra/database/prisma";
import type { Product } from "../../domain/entity/product";
import type { ProductsRepository } from "../../domain/repository/products-repository";
import { prismaProductToDomain } from "./mappers/prisma-product-mapper";

export class PrismaProductsRepository implements ProductsRepository {
  async create(product: Product): Promise<Product> {
    const createdProduct = await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });

    return prismaProductToDomain({
      id: createdProduct.id,
      name: createdProduct.name,
      price: createdProduct.price,
      createdAt: createdProduct.createdAt,
      updatedAt: createdProduct.updatedAt,
    });
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    return product
      ? prismaProductToDomain({
          id: product.id,
          name: product.name,
          price: product.price,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })
      : null;
  }
}
