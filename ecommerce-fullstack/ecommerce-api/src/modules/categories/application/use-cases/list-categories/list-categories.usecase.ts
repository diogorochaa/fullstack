import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from 'src/modules/categories/domain/constants/category.tokens';
import { CategoryRepository } from 'src/modules/categories/domain/repositories/category.repository';

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly repository: CategoryRepository,
  ) {}

  async execute(page: number, limit: number, search?: string) {
    return this.repository.findAllPaginated(page, limit, search);
  }
}
