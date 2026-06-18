import { Inject, Injectable } from '@nestjs/common';
import { UpdateCategoryDto } from 'src/modules/categories/application/dto/update-category.dto';
import { CATEGORY_REPOSITORY } from 'src/modules/categories/domain/constants/category.tokens';
import { Category } from 'src/modules/categories/domain/entities/category.entity';
import { CategoryAlreadyExistsException } from 'src/modules/categories/domain/exceptions/category-already-exists.exception';
import { CategoryNotFoundException } from 'src/modules/categories/domain/exceptions/category-not-found.exception';
import { CategoryRepository } from 'src/modules/categories/domain/repositories/category.repository';
import { toSlug } from 'src/shared/utils/slug.util';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly repository: CategoryRepository,
  ) {}

  async execute(id: string, input: UpdateCategoryDto): Promise<Category> {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    let slug = category.slug;

    if (input.name && input.name !== category.name) {
      slug = toSlug(input.name);
      const exists = await this.repository.findBySlug(slug);

      if (exists && exists.id !== id) {
        throw new CategoryAlreadyExistsException(slug);
      }
    }

    const updated = category.update({
      name: input.name,
      slug,
    });

    await this.repository.update(updated);

    return updated;
  }
}
