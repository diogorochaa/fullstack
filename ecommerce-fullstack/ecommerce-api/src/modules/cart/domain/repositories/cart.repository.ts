import { CartItem } from '../entities/cart-item.entity';
import { Cart } from '../entities/cart.entity';

export abstract class CartRepository {
  abstract findByUserId(userId: string): Promise<Cart | null>;
  abstract create(cart: Cart): Promise<void>;
  abstract findItemById(
    itemId: string,
  ): Promise<{ item: CartItem; userId: string } | null>;
  abstract upsertItem(
    cartId: string,
    productId: string,
    quantity: number,
    unitPrice: number,
  ): Promise<CartItem>;
  abstract updateItemQuantity(itemId: string, quantity: number): Promise<void>;
  abstract removeItem(itemId: string): Promise<void>;
  abstract clear(cartId: string): Promise<void>;
}
