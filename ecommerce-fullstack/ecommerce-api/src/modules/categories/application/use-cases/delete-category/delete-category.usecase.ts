import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from 'src/modules/categories/domain/constants/category.tokens';
import { CategoryNotFoundException } from 'src/modules/categories/domain/exceptions/category-not-found.exception';
import { CategoryRepository } from 'src/modules/categories/domain/repositories/category.repository';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly repository: CategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    await this.repository.delete(id);
  }
}
