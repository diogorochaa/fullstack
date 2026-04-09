import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionType } from './entities/Transaction';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  const transactionsService = {
    create: vi.fn(),
    findAllByUserId: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  let moduleRef: TestingModule;
  let controller: TransactionsController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: transactionsService,
        },
      ],
    }).compile();

    controller = moduleRef.get(TransactionsController);
  });

  it('creates a transaction for the active user', async () => {
    vi.mocked(transactionsService.create).mockResolvedValue({
      id: 'transaction-id',
    });

    await expect(
      controller.create('user-id', {
        bankAccountId: 'bank-account-id',
        categoryId: 'category-id',
        name: 'Salary',
        value: 2500,
        date: '2026-04-01T00:00:00.000Z',
        type: TransactionType.INCOME,
      }),
    ).resolves.toEqual({ id: 'transaction-id' });

    expect(transactionsService.create).toHaveBeenCalledWith('user-id', {
      bankAccountId: 'bank-account-id',
      categoryId: 'category-id',
      name: 'Salary',
      value: 2500,
      date: '2026-04-01T00:00:00.000Z',
      type: TransactionType.INCOME,
    });
  });

  it('forwards query filters to the service', async () => {
    vi.mocked(transactionsService.findAllByUserId).mockResolvedValue([
      { id: 'transaction-id' },
    ] as never);

    await expect(
      controller.findAll(
        'user-id',
        4,
        2026,
        'bank-account-id',
        TransactionType.EXPENSE,
      ),
    ).resolves.toEqual([{ id: 'transaction-id' }]);

    expect(transactionsService.findAllByUserId).toHaveBeenCalledWith(
      'user-id',
      {
        month: 4,
        year: 2026,
        bankAccountId: 'bank-account-id',
        type: TransactionType.EXPENSE,
      },
    );
  });

  it('updates a transaction by id', async () => {
    vi.mocked(transactionsService.update).mockResolvedValue({
      id: 'transaction-id',
    });

    await expect(
      controller.update('user-id', 'transaction-id', {
        bankAccountId: 'bank-account-id',
        categoryId: 'category-id',
        name: 'Updated salary',
        value: 2600,
        date: '2026-04-02T00:00:00.000Z',
        type: TransactionType.INCOME,
      }),
    ).resolves.toEqual({ id: 'transaction-id' });

    expect(transactionsService.update).toHaveBeenCalledWith(
      'user-id',
      'transaction-id',
      {
        bankAccountId: 'bank-account-id',
        categoryId: 'category-id',
        name: 'Updated salary',
        value: 2600,
        date: '2026-04-02T00:00:00.000Z',
        type: TransactionType.INCOME,
      },
    );
  });

  it('removes a transaction by id', async () => {
    vi.mocked(transactionsService.remove).mockResolvedValue(null);

    await expect(
      controller.remove('user-id', 'transaction-id'),
    ).resolves.toBeNull();

    expect(transactionsService.remove).toHaveBeenCalledWith(
      'user-id',
      'transaction-id',
    );
  });
});
