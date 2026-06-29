import { randomUUID } from "node:crypto";
import { Product } from "../../domain/entity/product";
import type { ProductsRepository } from "../../domain/repository/products-repository";
import type { CreateProductInputDto } from "../dtos/create-product-dto";
import type { ProductResponseDto } from "../dtos/product-response-dto";
import { productToResponseDto } from "../mappers/product-to-response-dto";

export class CreateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(input: CreateProductInputDto): Promise<ProductResponseDto> {
    const product = Product.create({
      id: randomUUID(),
      name: input.name,
      price: input.price,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.productsRepository.create(product);

    return productToResponseDto(product);
  }
}
