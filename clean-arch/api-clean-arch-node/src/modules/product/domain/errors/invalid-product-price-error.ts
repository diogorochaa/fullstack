export class InvalidProductPriceError extends Error {
  constructor(price: number) {
    super(`Invalid product price: ${price}`);
    this.name = "InvalidProductPriceError";
  }
}
