import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { buildPaginatedResult } from 'src/shared/types/paginated-result';
import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryMapper } from '../mappers/category.mapper';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<void> {
    await this.prisma.category.create({
      data: CategoryMapper.toPersistence(category),
    });
  }

  async update(category: Category): Promise<void> {
    const { id, ...data } = CategoryMapper.toPersistence(category);

    await this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      return null;
    }

    return CategoryMapper.toDomain(category);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { slug } });

    if (!category) {
      return null;
    }

    return CategoryMapper.toDomain(category);
  }

  async findAllPaginated(page: number, limit: number, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [records, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return buildPaginatedResult(
      records.map((record) => CategoryMapper.toDomain(record)),
      total,
      page,
      limit,
    );
  }
}
