import { InvalidProductNameError } from "../errors/invalid-product-name-error";
import { InvalidProductPriceError } from "../errors/invalid-product-price-error";

export type ProductProps = {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(props: ProductProps): Product {
    const name = props.name.trim();

    if (!name) {
      throw new InvalidProductNameError();
    }

    if (props.price <= 0) {
      throw new InvalidProductPriceError(props.price);
    }

    return new Product({
      ...props,
      name,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
