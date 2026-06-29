import type { UsersRepository } from "../../domain/repository/users-repository";
import type { GetUserByIdInputDto } from "../dtos/get-user-by-id-dto";
import type { UserResponseDto } from "../dtos/user-response-dto";
import { UserNotFoundError } from "../errors/user-not-found-error";
import { userToResponseDto } from "../mappers/user-to-response-dto";

export class GetUserByIdUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: GetUserByIdInputDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(input.id);

    if (!user) {
      throw new UserNotFoundError(input.id);
    }

    return userToResponseDto(user);
  }
}
