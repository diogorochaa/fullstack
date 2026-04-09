import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountType } from './entities/BankAccount';
import { BankAccountsService } from './services/bank-accounts.service';

describe('BankAccountsController', () => {
  const bankAccountsService = {
    create: vi.fn(),
    findAllByUserId: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  let moduleRef: TestingModule;
  let controller: BankAccountsController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [BankAccountsController],
      providers: [
        {
          provide: BankAccountsService,
          useValue: bankAccountsService,
        },
      ],
    }).compile();

    controller = moduleRef.get(BankAccountsController);
  });

  it('creates a bank account for the active user', async () => {
    vi.mocked(bankAccountsService.create).mockResolvedValue({
      id: 'bank-account-id',
    });

    await expect(
      controller.create('user-id', {
        name: 'Nubank',
        initialBalance: 1200,
        type: BankAccountType.CHECKING,
        color: '#7950f2',
      }),
    ).resolves.toEqual({ id: 'bank-account-id' });

    expect(bankAccountsService.create).toHaveBeenCalledWith('user-id', {
      name: 'Nubank',
      initialBalance: 1200,
      type: BankAccountType.CHECKING,
      color: '#7950f2',
    });
  });

  it('lists bank accounts for the active user', async () => {
    vi.mocked(bankAccountsService.findAllByUserId).mockResolvedValue([
      { id: 'bank-account-id', currentBalance: 123 },
    ] as never);

    await expect(controller.findAll('user-id')).resolves.toEqual([
      { id: 'bank-account-id', currentBalance: 123 },
    ]);

    expect(bankAccountsService.findAllByUserId).toHaveBeenCalledWith('user-id');
  });

  it('updates a bank account by id', async () => {
    vi.mocked(bankAccountsService.update).mockResolvedValue({
      id: 'bank-account-id',
    });

    await expect(
      controller.update('user-id', 'bank-account-id', {
        name: 'Nubank Updated',
        initialBalance: 1300,
        type: BankAccountType.CHECKING,
        color: '#7c3aed',
      }),
    ).resolves.toEqual({ id: 'bank-account-id' });

    expect(bankAccountsService.update).toHaveBeenCalledWith(
      'user-id',
      'bank-account-id',
      {
        name: 'Nubank Updated',
        initialBalance: 1300,
        type: BankAccountType.CHECKING,
        color: '#7c3aed',
      },
    );
  });

  it('removes a bank account by id', async () => {
    vi.mocked(bankAccountsService.remove).mockResolvedValue(null);

    await expect(
      controller.remove('user-id', 'bank-account-id'),
    ).resolves.toBeNull();

    expect(bankAccountsService.remove).toHaveBeenCalledWith(
      'user-id',
      'bank-account-id',
    );
  });
});
