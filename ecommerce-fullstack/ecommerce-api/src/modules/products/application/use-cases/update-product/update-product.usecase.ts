import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from 'src/modules/categories/domain/constants/category.tokens';
import { CategoryNotFoundException } from 'src/modules/categories/domain/exceptions/category-not-found.exception';
import { CategoryRepository } from 'src/modules/categories/domain/repositories/category.repository';
import { UpdateProductDto } from 'src/modules/products/application/dto/update-product.dto';
import { PRODUCT_REPOSITORY } from 'src/modules/products/domain/constants/product.tokens';
import { Product } from 'src/modules/products/domain/entities/product.entity';
import { ProductAlreadyExistsException } from 'src/modules/products/domain/exceptions/product-already-exists.exception';
import { ProductNotFoundException } from 'src/modules/products/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';
import { DomainEventsService } from 'src/shared/messaging/events/domain-events.service';
import { toSlug } from 'src/shared/utils/slug.util';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly events: DomainEventsService,
  ) {}

  async execute(id: string, input: UpdateProductDto): Promise<Product> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    if (input.categoryId) {
      const category = await this.categoryRepository.findById(input.categoryId);

      if (!category) {
        throw new CategoryNotFoundException(input.categoryId);
      }
    }

    let slug = product.slug;

    if (input.name && input.name !== product.name) {
      slug = toSlug(input.name);
      const exists = await this.repository.findBySlug(slug);

      if (exists && exists.id !== id) {
        throw new ProductAlreadyExistsException(slug);
      }
    }

    const updated = product.update({
      name: input.name,
      slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl,
      active: input.active,
      categoryId: input.categoryId,
    });

    await this.repository.update(updated);

    await this.events.productUpdated({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      price: updated.price,
      stock: updated.stock,
      active: updated.active,
      categoryId: updated.categoryId,
    });

    return updated;
  }
}
