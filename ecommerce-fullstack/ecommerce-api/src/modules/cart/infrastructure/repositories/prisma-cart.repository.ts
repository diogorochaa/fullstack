import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CartItem } from '../../domain/entities/cart-item.entity';
import { Cart } from '../../domain/entities/cart.entity';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartMapper } from '../mappers/cart.mapper';

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      return null;
    }

    return CartMapper.toDomain(cart);
  }

  async create(cart: Cart): Promise<void> {
    await this.prisma.cart.create({
      data: { id: cart.id, userId: cart.userId },
    });
  }

  async findItemById(itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        cart: true,
      },
    });

    if (!item) {
      return null;
    }

    return {
      item: CartMapper.itemToDomain(item),
      userId: item.cart.userId,
    };
  }

  async upsertItem(
    cartId: string,
    productId: string,
    quantity: number,
    unitPrice: number,
  ): Promise<CartItem> {
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
      include: { product: true },
    });

    if (existing) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      });

      return CartMapper.itemToDomain(updated);
    }

    const created = await this.prisma.cartItem.create({
      data: {
        id: randomUUID(),
        cartId,
        productId,
        quantity,
      },
      include: { product: true },
    });

    return CartMapper.itemToDomain(created);
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clear(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
