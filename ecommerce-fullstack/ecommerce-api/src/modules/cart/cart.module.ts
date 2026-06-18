import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import {
  AddCartItemUseCase,
  GetCartUseCase,
} from 'src/modules/cart/application/use-cases/cart/cart.usecase';
import {
  RemoveCartItemUseCase,
  UpdateCartItemUseCase,
} from 'src/modules/cart/application/use-cases/update-cart-item/update-cart-item.usecase';
import { CART_REPOSITORY } from 'src/modules/cart/domain/constants/cart.tokens';
import { PrismaCartRepository } from 'src/modules/cart/infrastructure/repositories/prisma-cart.repository';
import { CartController } from 'src/modules/cart/presentation/controllers/cart.controller';
import { ProductsModule } from 'src/modules/products/products.module';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [CartController],
  providers: [
    GetCartUseCase,
    AddCartItemUseCase,
    UpdateCartItemUseCase,
    RemoveCartItemUseCase,
    {
      provide: CART_REPOSITORY,
      useClass: PrismaCartRepository,
    },
  ],
  exports: [CART_REPOSITORY],
})
export class CartModule {}
