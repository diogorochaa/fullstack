import { Product } from "../../../domain/entity/product";

type PrismaDecimal = {
  toNumber(): number;
};

function decimalToNumber(value: number | PrismaDecimal): number {
  return typeof value === "number" ? value : value.toNumber();
}

export type PrismaProductModel = {
  id: string;
  name: string;
  price: number | PrismaDecimal;
  createdAt: Date;
  updatedAt: Date;
};

export function prismaProductToDomain(product: PrismaProductModel): Product {
  return Product.create({
    id: product.id,
    name: product.name,
    price: decimalToNumber(product.price),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  });
}
