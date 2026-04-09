import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionsRepository } from '../../../shared/database/repositories/transactions.repositories';
import { ValidateBankAccountOwnershipService } from '../../bank-accounts/services/validate-bank-account-ownership.service';
import { ValidateCategoryOwnershipService } from '../../categories/services/validate-category-ownership.service';
import { TransactionType } from '../entities/Transaction';
import { TransactionsService } from './transactions.service';
import { ValidateTransactionOwnershipService } from './validate-transaction-ownership.service';

describe('TransactionsService', () => {
  const transactionsRepository = {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const validateBankAccountOwnership = {
    validate: vi.fn(),
  };

  const validateCategoryOwnership = {
    validate: vi.fn(),
  };

  const validateTransactionOwnership = {
    validate: vi.fn(),
  };

  let moduleRef: TestingModule;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: transactionsRepository,
        },
        {
          provide: ValidateBankAccountOwnershipService,
          useValue: validateBankAccountOwnership,
        },
        {
          provide: ValidateCategoryOwnershipService,
          useValue: validateCategoryOwnership,
        },
        {
          provide: ValidateTransactionOwnershipService,
          useValue: validateTransactionOwnership,
        },
      ],
    }).compile();

    transactionsService = moduleRef.get(TransactionsService);
  });

  it('creates a transaction after validating related ownership', async () => {
    vi.mocked(validateBankAccountOwnership.validate).mockResolvedValue(
      undefined,
    );
    vi.mocked(validateCategoryOwnership.validate).mockResolvedValue(undefined);
    vi.mocked(transactionsRepository.create).mockResolvedValue({
      id: 'transaction-id',
    });

    await expect(
      transactionsService.create('user-id', {
        bankAccountId: 'bank-account-id',
        categoryId: 'category-id',
        name: 'Salary',
        value: 2500,
        date: '2026-04-01T00:00:00.000Z',
        type: TransactionType.INCOME,
      }),
    ).resolves.toEqual({ id: 'transaction-id' });

    expect(validateBankAccountOwnership.validate).toHaveBeenCalledWith(
      'user-id',
      'bank-account-id',
    );
    expect(validateCategoryOwnership.validate).toHaveBeenCalledWith(
      'user-id',
      'category-id',
    );
    expect(transactionsRepository.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-id',
        bankAccountId: 'bank-account-id',
        categoryId: 'category-id',
        date: '2026-04-01T00:00:00.000Z',
        name: 'Salary',
        type: TransactionType.INCOME,
        value: 2500,
      },
    });
  });

  it('filters transactions by month and year using a UTC range', async () => {
    vi.mocked(transactionsRepository.findMany).mockResolvedValue([
      { id: 'transaction-id' },
    ] as never);

    await expect(
      transactionsService.findAllByUserId('user-id', {
        month: 4,
        year: 2026,
        bankAccountId: 'bank-account-id',
        type: TransactionType.EXPENSE,
      }),
    ).resolves.toEqual([{ id: 'transaction-id' }]);

    expect(transactionsRepository.findMany).toHaveBeenCalledTimes(1);

    const query = vi.mocked(transactionsRepository.findMany).mock
      .calls[0]![0] as {
      where: {
        userId: string;
        bankAccountId?: string;
        type?: TransactionType;
        date: {
          gte: Date;
          lt: Date;
        };
      };
      orderBy: {
        date: 'desc';
      };
    };

    expect(query.where).toMatchObject({
      userId: 'user-id',
      bankAccountId: 'bank-account-id',
      type: TransactionType.EXPENSE,
    });
    expect(query.where.date.gte.toISOString()).toBe('2026-04-01T00:00:00.000Z');
    expect(query.where.date.lt.toISOString()).toBe('2026-05-01T00:00:00.000Z');
    expect(query.orderBy).toEqual({ date: 'desc' });
  });

  it('rejects invalid month filters before querying the repository', () => {
    expect(() =>
      transactionsService.findAllByUserId('user-id', {
        month: 13,
        year: 2026,
      }),
    ).toThrow(BadRequestException);

    expect(transactionsRepository.findMany).not.toHaveBeenCalled();
  });

  it('updates a transaction after validating ownership of all related entities', async () => {
    vi.mocked(validateTransactionOwnership.validate).mockResolvedValue(
      undefined,
    );
    vi.mocked(validateBankAccountOwnership.validate).mockResolvedValue(
      undefined,
    );
    vi.mocked(validateCategoryOwnership.validate).mockResolvedValue(undefined);
    vi.mocked(transactionsRepository.update).mockResolvedValue({
      id: 'transaction-id',
    });

    await expect(
      transactionsService.update('user-id', 'transaction-id', {
        bankAccountId: 'bank-account-id',
        categoryId: 'category-id',
        name: 'Updated salary',
        value: 2600,
        date: '2026-04-02T00:00:00.000Z',
        type: TransactionType.INCOME,
      }),
    ).resolves.toEqual({ id: 'transaction-id' });

    expect(validateTransactionOwnership.validate).toHaveBeenCalledWith(
      'user-id',
      'transaction-id',
    );
    expect(transactionsRepository.update).toHaveBeenCalledWith({
      where: { id: 'transaction-id' },
      data: {
        bankAccountId: 'bank-account-id',
        categoryId: 'category-id',
        date: '2026-04-02T00:00:00.000Z',
        name: 'Updated salary',
        type: TransactionType.INCOME,
        value: 2600,
      },
    });
  });

  it('removes a transaction only after ownership validation', async () => {
    vi.mocked(validateTransactionOwnership.validate).mockResolvedValue(
      undefined,
    );
    vi.mocked(transactionsRepository.delete).mockResolvedValue({
      id: 'transaction-id',
    });

    await expect(
      transactionsService.remove('user-id', 'transaction-id'),
    ).resolves.toBeNull();

    expect(validateTransactionOwnership.validate).toHaveBeenCalledWith(
      'user-id',
      'transaction-id',
    );
    expect(transactionsRepository.delete).toHaveBeenCalledWith({
      where: { id: 'transaction-id' },
    });
  });
});
