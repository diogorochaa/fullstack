import type { Product } from "../entity/product";

export interface ProductsRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
}
