import { Inject, Injectable } from '@nestjs/common';
import { AddCartItemDto } from 'src/modules/cart/application/dto/add-cart-item.dto';
import { CART_REPOSITORY } from 'src/modules/cart/domain/constants/cart.tokens';
import { CartRepository } from 'src/modules/cart/domain/repositories/cart.repository';
import { CartMapper } from 'src/modules/cart/infrastructure/mappers/cart.mapper';
import { PRODUCT_REPOSITORY } from 'src/modules/products/domain/constants/product.tokens';
import { InsufficientStockException } from 'src/modules/products/domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from 'src/modules/products/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';

@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return CartMapper.createEmpty(userId);
    }

    return cart;
  }
}

@Injectable()
export class AddCartItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(userId: string, input: AddCartItemDto) {
    const product = await this.productRepository.findById(input.productId);

    if (!product || !product.active) {
      throw new ProductNotFoundException(input.productId);
    }

    let cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      cart = CartMapper.createEmpty(userId);
      await this.cartRepository.create(cart);
    }

    const existingItem = cart.items.find(
      (item) => item.productId === input.productId,
    );
    const totalQuantity = (existingItem?.quantity ?? 0) + input.quantity;

    if (product.stock < totalQuantity) {
      throw new InsufficientStockException(product.name, product.stock);
    }

    await this.cartRepository.upsertItem(
      cart.id,
      input.productId,
      input.quantity,
      product.price,
    );

    return this.cartRepository.findByUserId(userId);
  }
}
