import { Category } from 'src/modules/categories/domain/entities/category.entity';
import { PaginatedResult } from 'src/shared/types/paginated-result';

export class CategoryResponse {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
  ) {}

  static fromEntity(category: Category): CategoryResponse {
    return new CategoryResponse(category.id, category.name, category.slug);
  }
}

export class PaginatedCategoryResponse {
  constructor(
    public readonly data: CategoryResponse[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly totalPages: number,
  ) {}

  static fromResult(
    result: PaginatedResult<Category>,
  ): PaginatedCategoryResponse {
    return new PaginatedCategoryResponse(
      result.data.map((category) => CategoryResponse.fromEntity(category)),
      result.total,
      result.page,
      result.limit,
      result.totalPages,
    );
  }
}
