import type { Product } from "../../domain/entity/product";
import type { ProductResponseDto } from "../dtos/product-response-dto";

export function productToResponseDto(product: Product): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
