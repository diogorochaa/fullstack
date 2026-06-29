import type { UsersRepository } from "../../domain/repository/users-repository";
import type { UserResponseDto } from "../dtos/user-response-dto";
import { userToResponseDto } from "../mappers/user-to-response-dto";

export class ListUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.list();

    return users.map((user) => userToResponseDto(user));
  }
}
