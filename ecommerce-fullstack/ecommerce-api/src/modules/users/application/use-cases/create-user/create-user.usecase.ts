import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/users/application/dto/create-user.dto';
import { USER_REPOSITORY } from 'src/modules/users/domain/constants/user.tokens';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { UserAlreadyExistsException } from 'src/modules/users/domain/exceptions/user-already-exists.exception';
import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';
import { EmailValueObject } from 'src/modules/users/domain/value-objects/email.vo';
import { PasswordValueObject } from 'src/modules/users/domain/value-objects/password.vo';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepository,
  ) {}

  async execute(input: CreateUserDto): Promise<User> {
    const email = EmailValueObject.create(input.email);

    const exists = await this.repository.findByEmail(email.getValue());

    if (exists) {
      throw new UserAlreadyExistsException(email.getValue());
    }

    const password = await PasswordValueObject.create(input.password);

    const user = User.create({
      id: randomUUID(),
      name: input.name,
      email,
      password,
    });

    await this.repository.create(user);

    return user;
  }
}
