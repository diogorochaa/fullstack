import { CartItem } from 'src/modules/cart/domain/entities/cart-item.entity';
import { Cart } from 'src/modules/cart/domain/entities/cart.entity';

export class CartItemResponse {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly subtotal: number,
  ) {}

  static fromEntity(item: CartItem): CartItemResponse {
    return new CartItemResponse(
      item.id,
      item.productId,
      item.quantity,
      item.unitPrice,
      item.subtotal(),
    );
  }
}

export class CartResponse {
  constructor(
    public readonly id: string | null,
    public readonly items: CartItemResponse[],
    public readonly subtotal: number,
  ) {}

  static fromEntity(cart: Cart): CartResponse {
    return new CartResponse(
      cart.items.length > 0 || cart.id ? cart.id : null,
      cart.items.map((item) => CartItemResponse.fromEntity(item)),
      cart.calculateSubtotal(),
    );
  }
}
