import { Inject, Injectable } from '@nestjs/common';
import { ListProductsQueryDto } from 'src/modules/products/application/dto/list-products-query.dto';
import { PRODUCT_REPOSITORY } from 'src/modules/products/domain/constants/product.tokens';
import { Product } from 'src/modules/products/domain/entities/product.entity';
import { ProductNotFoundException } from 'src/modules/products/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async execute(id: string, activeOnly = true): Promise<Product> {
    const product = await this.repository.findById(id);

    if (!product || (activeOnly && !product.active)) {
      throw new ProductNotFoundException(id);
    }

    return product;
  }
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async execute(query: ListProductsQueryDto) {
    return this.repository.findAllPaginated({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      search: query.search,
      categoryId: query.categoryId,
      activeOnly: true,
    });
  }
}
