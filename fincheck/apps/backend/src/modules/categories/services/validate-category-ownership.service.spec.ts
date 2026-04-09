import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoriesRepository } from '../../../shared/database/repositories/categories.repositories';
import { ValidateCategoryOwnershipService } from './validate-category-ownership.service';

describe('ValidateCategoryOwnershipService', () => {
  const categoriesRepository = {
    findFirst: vi.fn(),
  };

  let validateCategoryOwnershipService: ValidateCategoryOwnershipService;

  beforeEach(() => {
    validateCategoryOwnershipService = new ValidateCategoryOwnershipService(
      categoriesRepository as unknown as CategoriesRepository,
    );
  });

  it('passes when the category belongs to the user', async () => {
    vi.mocked(categoriesRepository.findFirst).mockResolvedValue({
      id: 'category-id',
    });

    await expect(
      validateCategoryOwnershipService.validate('user-id', 'category-id'),
    ).resolves.toBeUndefined();

    expect(categoriesRepository.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'category-id',
        userId: 'user-id',
      },
    });
  });

  it('throws when the category does not belong to the user', async () => {
    vi.mocked(categoriesRepository.findFirst).mockResolvedValue(null);

    await expect(
      validateCategoryOwnershipService.validate('user-id', 'category-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
