import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CreateCategoryUseCase } from 'src/modules/categories/application/use-cases/create-category/create-category.usecase';
import { DeleteCategoryUseCase } from 'src/modules/categories/application/use-cases/delete-category/delete-category.usecase';
import { GetCategoryUseCase } from 'src/modules/categories/application/use-cases/get-category/get-category.usecase';
import { ListCategoriesUseCase } from 'src/modules/categories/application/use-cases/list-categories/list-categories.usecase';
import { UpdateCategoryUseCase } from 'src/modules/categories/application/use-cases/update-category/update-category.usecase';
import { CATEGORY_REPOSITORY } from 'src/modules/categories/domain/constants/category.tokens';
import { PrismaCategoryRepository } from 'src/modules/categories/infrastructure/repositories/prisma-category.repository';
import { CategoriesController } from 'src/modules/categories/presentation/controllers/categories.controller';
import { RolesGuard } from 'src/shared/auth/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController],
  providers: [
    ListCategoriesUseCase,
    GetCategoryUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    RolesGuard,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
