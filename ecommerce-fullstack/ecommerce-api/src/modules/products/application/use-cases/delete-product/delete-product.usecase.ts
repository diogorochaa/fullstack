import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from 'src/modules/products/domain/constants/product.tokens';
import { ProductNotFoundException } from 'src/modules/products/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';
import { DomainEventsService } from 'src/shared/messaging/events/domain-events.service';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
    private readonly events: DomainEventsService,
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    const deactivated = product.deactivate();
    await this.repository.update(deactivated);

    await this.events.productDeleted({ id: product.id });
  }
}
