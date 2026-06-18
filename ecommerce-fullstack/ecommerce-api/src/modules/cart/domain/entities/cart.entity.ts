import { CartItem } from './cart-item.entity';

export class Cart {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: CartItem[],
  ) {}

  static create(props: { id: string; userId: string; items?: CartItem[] }) {
    return new Cart(props.id, props.userId, props.items ?? []);
  }

  calculateSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal(), 0);
  }

  withItems(items: CartItem[]) {
    return Cart.create({ id: this.id, userId: this.userId, items });
  }
}
