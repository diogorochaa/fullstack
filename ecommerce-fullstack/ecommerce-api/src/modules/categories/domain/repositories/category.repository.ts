import { PaginatedResult } from 'src/shared/types/paginated-result';
import { Category } from '../entities/category.entity';

export abstract class CategoryRepository {
  abstract create(category: Category): Promise<void>;
  abstract update(category: Category): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<Category | null>;
  abstract findBySlug(slug: string): Promise<Category | null>;
  abstract findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResult<Category>>;
}
