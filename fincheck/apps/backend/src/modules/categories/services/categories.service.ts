import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from '../../../shared/database/repositories/categories.repositories';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(userId: string, createCategoryDto: CreateCategoryDto) {
    const { name, type, icon } = createCategoryDto;

    return this.categoriesRepository.create({
      data: {
        userId,
        name,
        type,
        icon: icon?.trim() || 'tag',
      },
    });
  }

  findAllByUserId(userId: string) {
    return this.categoriesRepository.findMany({ where: { userId } });
  }
}
