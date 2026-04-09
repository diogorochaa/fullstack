import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepository } from '../../shared/database/repositories/users.repositories';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const usersRepository = {
    findUnique: vi.fn(),
  };

  let moduleRef: TestingModule;
  let usersService: UsersService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
      ],
    }).compile();

    usersService = moduleRef.get(UsersService);
  });

  it('fetches the current user by id with a lean selection', async () => {
    vi.mocked(usersRepository.findUnique).mockResolvedValue({
      name: 'John Doe',
      email: 'john@doe.com',
    });

    await expect(usersService.getUserById('user-id')).resolves.toEqual({
      name: 'John Doe',
      email: 'john@doe.com',
    });

    expect(usersRepository.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      select: {
        name: true,
        email: true,
      },
    });
  });
});
