import { randomUUID } from 'node:crypto';

import { CartItem } from '../../domain/entities/cart-item.entity';
import { Cart } from '../../domain/entities/cart.entity';

type CartItemRecord = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: { price: { toNumber?: () => number } | number | string };
};

type CartRecord = {
  id: string;
  userId: string;
  items: CartItemRecord[];
};

export class CartMapper {
  static itemToDomain(record: CartItemRecord): CartItem {
    return new CartItem(
      record.id,
      record.cartId,
      record.productId,
      record.quantity,
      Number(record.product.price),
    );
  }

  static toDomain(record: CartRecord): Cart {
    return Cart.create({
      id: record.id,
      userId: record.userId,
      items: record.items.map((item) => CartMapper.itemToDomain(item)),
    });
  }

  static createEmpty(userId: string): Cart {
    return Cart.create({ id: randomUUID(), userId });
  }
}
