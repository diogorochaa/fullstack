import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionsRepository } from '../../../shared/database/repositories/transactions.repositories';
import { ValidateTransactionOwnershipService } from './validate-transaction-ownership.service';

describe('ValidateTransactionOwnershipService', () => {
  const transactionsRepository = {
    findFirst: vi.fn(),
  };

  let validateTransactionOwnershipService: ValidateTransactionOwnershipService;

  beforeEach(() => {
    validateTransactionOwnershipService =
      new ValidateTransactionOwnershipService(
        transactionsRepository as unknown as TransactionsRepository,
      );
  });

  it('passes when the transaction belongs to the user', async () => {
    vi.mocked(transactionsRepository.findFirst).mockResolvedValue({
      id: 'transaction-id',
    });

    await expect(
      validateTransactionOwnershipService.validate('user-id', 'transaction-id'),
    ).resolves.toBeUndefined();

    expect(transactionsRepository.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'transaction-id',
        userId: 'user-id',
      },
    });
  });

  it('throws when the transaction does not belong to the user', async () => {
    vi.mocked(transactionsRepository.findFirst).mockResolvedValue(null);

    await expect(
      validateTransactionOwnershipService.validate('user-id', 'transaction-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
