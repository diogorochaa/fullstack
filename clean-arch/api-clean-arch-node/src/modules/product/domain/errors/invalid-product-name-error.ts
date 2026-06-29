export class InvalidProductNameError extends Error {
  constructor() {
    super("Invalid product name.");
    this.name = "InvalidProductNameError";
  }
}
