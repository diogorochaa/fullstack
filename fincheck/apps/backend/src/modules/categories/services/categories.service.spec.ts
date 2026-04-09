import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoriesRepository } from '../../../shared/database/repositories/categories.repositories';
import { TransactionType } from '../../transactions/entities/Transaction';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  const categoriesRepository = {
    create: vi.fn(),
    findMany: vi.fn(),
  };

  let moduleRef: TestingModule;
  let categoriesService: CategoriesService;

  beforeEach(async () => {
    vi.clearAllMocks();

    moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: categoriesRepository,
        },
      ],
    }).compile();

    categoriesService = moduleRef.get(CategoriesService);
  });

  it('creates category linked to authenticated user', async () => {
    vi.mocked(categoriesRepository.create).mockResolvedValue({
      id: 'category-id',
      name: 'Alimentacao',
      type: TransactionType.EXPENSE,
      icon: 'tag',
      userId: 'user-id',
    });

    await expect(
      categoriesService.create('user-id', {
        name: 'Alimentacao',
        type: TransactionType.EXPENSE,
      }),
    ).resolves.toEqual({
      id: 'category-id',
      name: 'Alimentacao',
      type: TransactionType.EXPENSE,
      icon: 'tag',
      userId: 'user-id',
    });

    expect(categoriesRepository.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-id',
        name: 'Alimentacao',
        type: TransactionType.EXPENSE,
        icon: 'tag',
      },
    });
  });

  it('lists categories for the authenticated user only', async () => {
    vi.mocked(categoriesRepository.findMany).mockResolvedValue([
      { id: 'category-id', name: 'Salario' },
    ]);

    await expect(categoriesService.findAllByUserId('user-id')).resolves.toEqual(
      [{ id: 'category-id', name: 'Salario' }],
    );

    expect(categoriesRepository.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
    });
  });
});
