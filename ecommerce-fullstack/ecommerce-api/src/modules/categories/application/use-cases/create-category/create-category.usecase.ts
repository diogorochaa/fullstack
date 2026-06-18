import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from 'src/modules/categories/application/dto/create-category.dto';
import { CATEGORY_REPOSITORY } from 'src/modules/categories/domain/constants/category.tokens';
import { Category } from 'src/modules/categories/domain/entities/category.entity';
import { CategoryAlreadyExistsException } from 'src/modules/categories/domain/exceptions/category-already-exists.exception';
import { CategoryRepository } from 'src/modules/categories/domain/repositories/category.repository';
import { toSlug } from 'src/shared/utils/slug.util';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly repository: CategoryRepository,
  ) {}

  async execute(input: CreateCategoryDto): Promise<Category> {
    const slug = toSlug(input.name);
    const exists = await this.repository.findBySlug(slug);

    if (exists) {
      throw new CategoryAlreadyExistsException(slug);
    }

    const category = Category.create({
      id: randomUUID(),
      name: input.name,
      slug,
    });

    await this.repository.create(category);

    return category;
  }
}
