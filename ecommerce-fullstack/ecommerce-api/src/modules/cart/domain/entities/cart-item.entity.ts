export class CartItem {
  constructor(
    public readonly id: string,
    public readonly cartId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
  ) {}

  subtotal(): number {
    return this.unitPrice * this.quantity;
  }

  updateQuantity(quantity: number) {
    return new CartItem(
      this.id,
      this.cartId,
      this.productId,
      quantity,
      this.unitPrice,
    );
  }
}
