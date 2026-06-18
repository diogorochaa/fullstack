import { Category } from '../../domain/entities/category.entity';

type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
};

export class CategoryMapper {
  static toPersistence(category: Category): CategoryRecord {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
    };
  }

  static toDomain(record: CategoryRecord): Category {
    return Category.create({
      id: record.id,
      name: record.name,
      slug: record.slug,
    });
  }
}
