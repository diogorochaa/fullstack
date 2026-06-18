import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { buildPaginatedResult } from 'src/shared/types/paginated-result';
import { Product } from '../../domain/entities/product.entity';
import {
  ProductFilters,
  ProductRepository,
} from '../../domain/repositories/product.repository';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<void> {
    const data = ProductMapper.toPersistence(product);

    await this.prisma.product.create({ data });
  }

  async update(product: Product): Promise<void> {
    const { id, ...data } = ProductMapper.toPersistence(product);

    await this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      return null;
    }

    return ProductMapper.toDomain(product);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { slug } });

    if (!product) {
      return null;
    }

    return ProductMapper.toDomain(product);
  }

  async findAllPaginated(filters: ProductFilters) {
    const where = {
      ...(filters.activeOnly ? { active: true } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                name: {
                  contains: filters.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: filters.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResult(
      records.map((record) => ProductMapper.toDomain(record)),
      total,
      filters.page,
      filters.limit,
    );
  }
}
