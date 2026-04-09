import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BankAccountsRepository } from '../../../shared/database/repositories/bank-accounts.repositories';
import { ValidateBankAccountOwnershipService } from './validate-bank-account-ownership.service';

describe('ValidateBankAccountOwnershipService', () => {
  const bankAccountsRepository = {
    findFirst: vi.fn(),
  };

  let validateBankAccountOwnershipService: ValidateBankAccountOwnershipService;

  beforeEach(() => {
    validateBankAccountOwnershipService =
      new ValidateBankAccountOwnershipService(
        bankAccountsRepository as unknown as BankAccountsRepository,
      );
  });

  it('passes when the bank account belongs to the user', async () => {
    vi.mocked(bankAccountsRepository.findFirst).mockResolvedValue({
      id: 'bank-account-id',
    });

    await expect(
      validateBankAccountOwnershipService.validate(
        'user-id',
        'bank-account-id',
      ),
    ).resolves.toBeUndefined();

    expect(bankAccountsRepository.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'bank-account-id',
        userId: 'user-id',
      },
    });
  });

  it('throws when the bank account does not belong to the user', async () => {
    vi.mocked(bankAccountsRepository.findFirst).mockResolvedValue(null);

    await expect(
      validateBankAccountOwnershipService.validate(
        'user-id',
        'bank-account-id',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
