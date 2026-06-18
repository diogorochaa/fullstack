import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from 'src/modules/categories/domain/constants/category.tokens';
import { Category } from 'src/modules/categories/domain/entities/category.entity';
import { CategoryNotFoundException } from 'src/modules/categories/domain/exceptions/category-not-found.exception';
import { CategoryRepository } from 'src/modules/categories/domain/repositories/category.repository';

@Injectable()
export class GetCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly repository: CategoryRepository,
  ) {}

  async execute(id: string): Promise<Category> {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    return category;
  }
}
