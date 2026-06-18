import { Product } from 'src/modules/products/domain/entities/product.entity';
import { PaginatedResult } from 'src/shared/types/paginated-result';

export class ProductResponse {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly imageUrl: string | null,
    public readonly active: boolean,
    public readonly categoryId: string,
  ) {}

  static fromEntity(product: Product): ProductResponse {
    return new ProductResponse(
      product.id,
      product.name,
      product.slug,
      product.description,
      product.price,
      product.stock,
      product.imageUrl,
      product.active,
      product.categoryId,
    );
  }
}

export class PaginatedProductResponse {
  constructor(
    public readonly data: ProductResponse[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly totalPages: number,
  ) {}

  static fromResult(
    result: PaginatedResult<Product>,
  ): PaginatedProductResponse {
    return new PaginatedProductResponse(
      result.data.map((product) => ProductResponse.fromEntity(product)),
      result.total,
      result.page,
      result.limit,
      result.totalPages,
    );
  }
}
