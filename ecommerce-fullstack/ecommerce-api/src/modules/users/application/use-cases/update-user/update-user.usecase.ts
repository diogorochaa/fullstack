import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from 'src/modules/users/application/dto/update-user.dto';
import { USER_REPOSITORY } from 'src/modules/users/domain/constants/user.tokens';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { UserAlreadyExistsException } from 'src/modules/users/domain/exceptions/user-already-exists.exception';
import { UserNotFoundException } from 'src/modules/users/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';
import { EmailValueObject } from 'src/modules/users/domain/value-objects/email.vo';
import { PasswordValueObject } from 'src/modules/users/domain/value-objects/password.vo';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepository,
  ) {}

  async execute(id: string, input: UpdateUserDto): Promise<User> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    let email = user.email;

    if (input.email && input.email !== user.email.getValue()) {
      const newEmail = EmailValueObject.create(input.email);
      const exists = await this.repository.findByEmail(newEmail.getValue());

      if (exists && exists.id !== id) {
        throw new UserAlreadyExistsException(newEmail.getValue());
      }

      email = newEmail;
    }

    let password = user.password;

    if (input.password) {
      password = await PasswordValueObject.create(input.password);
    }

    const updatedUser = user.update({
      name: input.name,
      email,
      password,
    });

    await this.repository.update(updatedUser);

    return updatedUser;
  }
}
