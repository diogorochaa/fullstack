import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CategoriesModule } from 'src/modules/categories/categories.module';
import { CreateProductUseCase } from 'src/modules/products/application/use-cases/create-product/create-product.usecase';
import { DeleteProductUseCase } from 'src/modules/products/application/use-cases/delete-product/delete-product.usecase';
import {
  GetProductUseCase,
  ListProductsUseCase,
} from 'src/modules/products/application/use-cases/get-product/get-product.usecase';
import { UpdateProductUseCase } from 'src/modules/products/application/use-cases/update-product/update-product.usecase';
import { PRODUCT_REPOSITORY } from 'src/modules/products/domain/constants/product.tokens';
import { PrismaProductRepository } from 'src/modules/products/infrastructure/repositories/prisma-product.repository';
import { ProductsController } from 'src/modules/products/presentation/controllers/products.controller';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { EventsModule } from 'src/shared/messaging/events/events.module';

@Module({
  imports: [AuthModule, CategoriesModule, EventsModule],
  controllers: [ProductsController],
  providers: [
    ListProductsUseCase,
    GetProductUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    RolesGuard,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
