export class InvalidOrderQuantityError extends Error {
  constructor(quantity: number) {
    super(`Invalid order quantity: ${quantity}`);
    this.name = "InvalidOrderQuantityError";
  }
}
