import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/modules/users/domain/constants/user.tokens';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { UserNotFoundException } from 'src/modules/users/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }
}
