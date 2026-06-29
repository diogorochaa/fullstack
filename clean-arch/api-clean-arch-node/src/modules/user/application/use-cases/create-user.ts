import type { UsersRepository } from "../../domain/repository/users-repository";
import { Email } from "../../domain/value-objects/email";
import type { CreateUserInputDto } from "../dtos/create-user-dto";
import type { UserResponseDto } from "../dtos/user-response-dto";
import { EmailAlreadyInUseError } from "../errors/email-already-in-use-error";
import { userToResponseDto } from "../mappers/user-to-response-dto";

export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: CreateUserInputDto): Promise<UserResponseDto> {
    const email = Email.create(input.email);

    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new EmailAlreadyInUseError(email.value);
    }

    const user = await this.usersRepository.create({
      name: input.name.trim(),
      email,
    });

    return userToResponseDto(user);
  }
}
