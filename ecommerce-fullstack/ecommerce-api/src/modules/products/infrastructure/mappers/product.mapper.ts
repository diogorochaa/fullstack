import { Product } from '../../domain/entities/product.entity';

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: { toNumber?: () => number } | number | string;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  categoryId: string;
};

export class ProductMapper {
  static toPersistence(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      active: product.active,
      categoryId: product.categoryId,
    };
  }

  static toDomain(record: ProductRecord): Product {
    return Product.create({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      price: Number(record.price),
      stock: record.stock,
      imageUrl: record.imageUrl,
      active: record.active,
      categoryId: record.categoryId,
    });
  }
}
