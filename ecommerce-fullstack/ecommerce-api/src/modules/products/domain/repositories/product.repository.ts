import { PaginatedResult } from 'src/shared/types/paginated-result';
import { Product } from '../entities/product.entity';

export type ProductFilters = {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  activeOnly?: boolean;
};

export abstract class ProductRepository {
  abstract create(product: Product): Promise<void>;
  abstract update(product: Product): Promise<void>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findBySlug(slug: string): Promise<Product | null>;
  abstract findAllPaginated(
    filters: ProductFilters,
  ): Promise<PaginatedResult<Product>>;
}
