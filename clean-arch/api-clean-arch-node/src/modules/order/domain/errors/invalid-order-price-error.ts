export class InvalidOrderPriceError extends Error {
  constructor(price: number) {
    super(`Invalid order price: ${price}`);
    this.name = "InvalidOrderPriceError";
  }
}
