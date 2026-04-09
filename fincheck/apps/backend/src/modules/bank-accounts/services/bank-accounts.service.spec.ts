import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BankAccountsRepository } from '../../../shared/database/repositories/bank-accounts.repositories';
import { BankAccountType } from '../../bank-accounts/entities/BankAccount';
import { BankAccountsService } from './bank-accounts.service';
import { ValidateBankAccountOwnershipService } from './validate-bank-account-ownership.service';

describe('BankAccountsService', () => {
  const bankAccountsRepository = {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const validateBankAccountOwnership = {
    validate: vi.fn(),
  };

  let moduleRef: TestingModule;
  let bankAccountsService: BankAccountsService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        BankAccountsService,
        {
          provide: BankAccountsRepository,
          useValue: bankAccountsRepository,
        },
        {
          provide: ValidateBankAccountOwnershipService,
          useValue: validateBankAccountOwnership,
        },
      ],
    }).compile();

    bankAccountsService = moduleRef.get(BankAccountsService);
  });

  it('creates a bank account for the current user', async () => {
    vi.mocked(bankAccountsRepository.create).mockResolvedValue({
      id: 'bank-account-id',
    });

    await expect(
      bankAccountsService.create('user-id', {
        name: 'Nubank',
        initialBalance: 1200,
        type: BankAccountType.CHECKING,
        color: '#7950f2',
      }),
    ).resolves.toEqual({ id: 'bank-account-id' });

    expect(bankAccountsRepository.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-id',
        name: 'Nubank',
        color: '#7950f2',
        initialBalance: 1200,
        type: 'CHECKING',
      },
    });
  });

  it('calculates current balances from transaction history', async () => {
    vi.mocked(bankAccountsRepository.findMany).mockResolvedValue([
      {
        id: 'bank-account-1',
        name: 'Nubank',
        color: '#7950f2',
        initialBalance: 100,
        type: BankAccountType.CHECKING,
        transactions: [
          { type: 'INCOME', value: 150 },
          { type: 'EXPENSE', value: 20 },
        ],
      },
      {
        id: 'bank-account-2',
        name: 'Carteira',
        color: '#0ea5e9',
        initialBalance: 25,
        type: BankAccountType.CASH,
        transactions: [],
      },
    ] as never);

    await expect(
      bankAccountsService.findAllByUserId('user-id'),
    ).resolves.toEqual([
      {
        id: 'bank-account-1',
        name: 'Nubank',
        color: '#7950f2',
        initialBalance: 100,
        type: BankAccountType.CHECKING,
        currentBalance: 230,
      },
      {
        id: 'bank-account-2',
        name: 'Carteira',
        color: '#0ea5e9',
        initialBalance: 25,
        type: BankAccountType.CASH,
        currentBalance: 25,
      },
    ]);

    expect(bankAccountsRepository.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      include: {
        transactions: {
          select: {
            type: true,
            value: true,
          },
        },
      },
    });
  });

  it('validates ownership before updating a bank account', async () => {
    vi.mocked(validateBankAccountOwnership.validate).mockResolvedValue(
      undefined,
    );
    vi.mocked(bankAccountsRepository.update).mockResolvedValue({
      id: 'bank-account-id',
    });

    await expect(
      bankAccountsService.update('user-id', 'bank-account-id', {
        name: 'Nubank Digital',
        initialBalance: 1500,
        type: BankAccountType.CHECKING,
        color: '#7c3aed',
      }),
    ).resolves.toEqual({ id: 'bank-account-id' });

    expect(validateBankAccountOwnership.validate).toHaveBeenCalledWith(
      'user-id',
      'bank-account-id',
    );
    expect(bankAccountsRepository.update).toHaveBeenCalledWith({
      where: { id: 'bank-account-id' },
      data: {
        name: 'Nubank Digital',
        color: '#7c3aed',
        initialBalance: 1500,
        type: BankAccountType.CHECKING,
      },
    });
  });

  it('removes a bank account only after ownership validation', async () => {
    vi.mocked(validateBankAccountOwnership.validate).mockResolvedValue(
      undefined,
    );
    vi.mocked(bankAccountsRepository.delete).mockResolvedValue({
      id: 'bank-account-id',
    });

    await expect(
      bankAccountsService.remove('user-id', 'bank-account-id'),
    ).resolves.toBeNull();

    expect(validateBankAccountOwnership.validate).toHaveBeenCalledWith(
      'user-id',
      'bank-account-id',
    );
    expect(bankAccountsRepository.delete).toHaveBeenCalledWith({
      where: { id: 'bank-account-id' },
    });
  });
});
