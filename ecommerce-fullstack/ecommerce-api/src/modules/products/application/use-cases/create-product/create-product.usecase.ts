import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from 'src/modules/categories/domain/constants/category.tokens';
import { CategoryNotFoundException } from 'src/modules/categories/domain/exceptions/category-not-found.exception';
import { CategoryRepository } from 'src/modules/categories/domain/repositories/category.repository';
import { CreateProductDto } from 'src/modules/products/application/dto/create-product.dto';
import { PRODUCT_REPOSITORY } from 'src/modules/products/domain/constants/product.tokens';
import { Product } from 'src/modules/products/domain/entities/product.entity';
import { ProductAlreadyExistsException } from 'src/modules/products/domain/exceptions/product-already-exists.exception';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';
import { DomainEventsService } from 'src/shared/messaging/events/domain-events.service';
import { toSlug } from 'src/shared/utils/slug.util';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly events: DomainEventsService,
  ) {}

  async execute(input: CreateProductDto): Promise<Product> {
    const category = await this.categoryRepository.findById(input.categoryId);

    if (!category) {
      throw new CategoryNotFoundException(input.categoryId);
    }

    const slug = toSlug(input.name);
    const exists = await this.repository.findBySlug(slug);

    if (exists) {
      throw new ProductAlreadyExistsException(slug);
    }

    const product = Product.create({
      id: randomUUID(),
      name: input.name,
      slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
    });

    await this.repository.create(product);

    await this.events.productCreated({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
      active: product.active,
      categoryId: product.categoryId,
    });

    return product;
  }
}
