import { Inject, Injectable } from '@nestjs/common';
import { UpdateCartItemDto } from 'src/modules/cart/application/dto/update-cart-item.dto';
import { CART_REPOSITORY } from 'src/modules/cart/domain/constants/cart.tokens';
import { CartForbiddenException } from 'src/modules/cart/domain/exceptions/cart-forbidden.exception';
import { CartItemNotFoundException } from 'src/modules/cart/domain/exceptions/cart-not-found.exception';
import { CartRepository } from 'src/modules/cart/domain/repositories/cart.repository';
import { PRODUCT_REPOSITORY } from 'src/modules/products/domain/constants/product.tokens';
import { InsufficientStockException } from 'src/modules/products/domain/exceptions/insufficient-stock.exception';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';

@Injectable()
export class UpdateCartItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(userId: string, itemId: string, input: UpdateCartItemDto) {
    const result = await this.cartRepository.findItemById(itemId);

    if (!result) {
      throw new CartItemNotFoundException(itemId);
    }

    if (result.userId !== userId) {
      throw new CartForbiddenException();
    }

    const product = await this.productRepository.findById(
      result.item.productId,
    );

    if (!product) {
      throw new CartItemNotFoundException(itemId);
    }

    if (product.stock < input.quantity) {
      throw new InsufficientStockException(product.name, product.stock);
    }

    await this.cartRepository.updateItemQuantity(itemId, input.quantity);

    return this.cartRepository.findByUserId(userId);
  }
}

@Injectable()
export class RemoveCartItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(userId: string, itemId: string) {
    const result = await this.cartRepository.findItemById(itemId);

    if (!result) {
      throw new CartItemNotFoundException(itemId);
    }

    if (result.userId !== userId) {
      throw new CartForbiddenException();
    }

    await this.cartRepository.removeItem(itemId);

    return this.cartRepository.findByUserId(userId);
  }
}
